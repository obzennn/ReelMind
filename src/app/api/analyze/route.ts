import { NextResponse } from 'next/server';
import ytDlp from 'yt-dlp-exec';
import OpenAI from 'openai';

interface SubtitleEvent {
  startMs: number;
  endMs: number;
  text: string;
}

/**
 * Extracts subtitles from a YouTube video URL without downloading the video.
 * Prioritizes manual English subtitles, then falls back to auto-generated English captions.
 */
export async function extractSubtitles(videoUrl: string): Promise<SubtitleEvent[]> {
    // 1. Fetch metadata without downloading the video
    const output: any = await ytDlp(videoUrl, {
        dumpJson: true,
        skipDownload: true,
        noWarnings: true,
        noPlaylist: true,
    });

    // Helper to locate the best English json3 track
    const findEnglishJson3Url = (captionObj: any) => {
        if (!captionObj) return null;
        // Search for 'en', 'en-US', 'en-GB', etc.
        const enKey = Object.keys(captionObj).find(k => k.startsWith('en'));
        if (!enKey) return null;
        const format = captionObj[enKey].find((f: any) => f.ext === 'json3');
        return format ? format.url : null;
    };

    // 2. Prioritize manual subtitles over auto-captions
    const json3Url = findEnglishJson3Url(output.subtitles) || findEnglishJson3Url(output.automatic_captions);

    if (!json3Url) {
        throw new Error('No English subtitles or automatic captions found for this video.');
    }

    // 3. Fetch the actual subtitle JSON
    const res = await fetch(json3Url);
    if (!res.ok) {
        throw new Error(`Failed to fetch subtitles from YouTube (HTTP ${res.status})`);
    }
    const data = await res.json();

    // 4. Parse the events into a clean timestamped array
    const events = data.events || [];
    
    const parsedSubtitles: SubtitleEvent[] = events
        .filter((e: any) => e.segs) // Filter out empty events/metadata wrappers
        .map((e: any) => {
            const text = e.segs
                .map((s: any) => s.utf8)
                .join('')
                .replace(/\n/g, ' ')
                .trim();
            
            return {
                startMs: e.tStartMs || 0,
                endMs: (e.tStartMs || 0) + (e.dDurationMs || 0),
                text
            };
        })
        .filter((e: SubtitleEvent) => e.text.length > 0);

    return parsedSubtitles;
}

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing videoUrl' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is missing. Please set it in your environment variables.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    let subtitles: SubtitleEvent[];
    try {
      subtitles = await extractSubtitles(videoUrl);
      console.log(`Extracted ${subtitles.length} subtitle events for ${videoUrl}`);
    } catch (e: any) {
      console.error("Subtitle extraction failed:", e);
      return NextResponse.json(
        { error: 'Failed to extract subtitles', details: e.message },
        { status: 400 }
      );
    }

    // Convert to text transcript with timestamps
    const transcript = subtitles.map(s => {
      const start = Math.floor(s.startMs / 1000);
      return `[${start}s] ${s.text}`;
    }).join('\n');

    const prompt = `You are an expert video editor and social media manager.
Your task is to analyze the following video transcript and identify the most engaging, viral-worthy clips.
Each clip should be a self-contained, interesting segment suitable for TikTok, YouTube Shorts, or Instagram Reels (typically 15-60 seconds long).
Only return clips with a viralityScore of 80 or higher (out of 100).
Return the result EXACTLY as a JSON object with a single key "clips", which is an array of objects.
Each clip object MUST have the following properties:
- id: a unique string identifier (e.g. "clip-1")
- title: a catchy title for the clip
- description: a brief explanation of why this clip is good
- viralityScore: a number from 80 to 100 representing how viral it could be
- startTime: the start time in seconds (number)
- endTime: the end time in seconds (number)
- tags: an array of strings representing relevant hashtags or keywords

Here is the transcript:
${transcript}`;

    let parsedContent;
    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant that always outputs valid JSON. Output only JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      parsedContent = JSON.parse(content || '{}');
    } catch (llmError: any) {
      console.error("LLM Generation failed:", llmError);
      return NextResponse.json(
        { error: 'Failed to analyze video transcript', details: llmError.message },
        { status: 500 }
      );
    }

    const clips = parsedContent.clips || [];
    const filteredClips = clips.filter((c: any) => c.viralityScore >= 80);

    return NextResponse.json({ clips: filteredClips });
  } catch (error: any) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
