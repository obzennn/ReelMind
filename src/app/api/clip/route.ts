import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { create as createYtDlp } from "yt-dlp-exec";
import { execa } from "execa";

const isWin = os.platform() === "win32";

// Turbopack path virtualization fix for Next.js
const ytdlp = createYtDlp(
  path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", isWin ? "yt-dlp.exe" : "yt-dlp")
);

let ffmpegPath = "";
try {
  // Require to ensure Next.js traces the dependency
  require("ffmpeg-static");
  // Override the virtual path with the actual absolute path
  ffmpegPath = path.join(process.cwd(), "node_modules", "ffmpeg-static", isWin ? "ffmpeg.exe" : "ffmpeg");
} catch (e) {
  console.warn("ffmpeg-static not found");
}

// Validate YouTube URL
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

function parseTimestampToSeconds(ts: string): number | null {
  const parts = ts.split(":");
  if (parts.length > 3 || parts.length === 0) return null;
  let seconds = 0;
  for (let i = 0; i < parts.length; i++) {
    const val = parseInt(parts[parts.length - 1 - i], 10);
    if (isNaN(val)) return null;
    seconds += val * Math.pow(60, i);
  }
  return seconds;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url;
    const startTime = body.startTime;
    const endTime = body.endTime;
    const includeSubtitles = Boolean(body.includeSubtitles);
    const aspectRatio = body.aspectRatio || "original";
    const brollEnabled = Boolean(body.brollEnabled);
    const brollUrl = body.brollUrl;

    if (!url || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!YOUTUBE_URL_REGEX.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const startSeconds = parseTimestampToSeconds(startTime);
    const endSeconds = parseTimestampToSeconds(endTime);

    if (startSeconds === null || endSeconds === null || startSeconds >= endSeconds) {
      return NextResponse.json({ error: "Invalid timestamps. Start time must be before end time." }, { status: 400 });
    }
    
    const duration = endSeconds - startSeconds;

    if (duration > 600) {
      return NextResponse.json({ error: "Clip duration cannot exceed 10 minutes." }, { status: 400 });
    }

    if (!ffmpegPath) {
      return NextResponse.json({ error: "Server configuration error: ffmpeg is missing." }, { status: 500 });
    }

    const tempDir = os.tmpdir();
    const sessionId = Math.random().toString(36).substring(7);
    
    let outputPath = path.join(tempDir, `clip_${sessionId}.mp4`);
    let subtitleWarning = false;

    if (brollEnabled && brollUrl) {
      const mainVideoPath = path.join(tempDir, `main_${sessionId}.mp4`);
      const brollVideoPath = path.join(tempDir, `broll_${sessionId}.mp4`);
      const finalOutputPath = path.join(tempDir, `final_${sessionId}.mp4`);

      const ytDlpOptionsMain: any = {
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
        downloadSections: `*${startSeconds}-${endSeconds}`,
        forceKeyframesAtCuts: true,
        ffmpegLocation: ffmpegPath,
        output: mainVideoPath,
        noPlaylist: true,
        ignoreErrors: true,
      };

      if (includeSubtitles) {
        ytDlpOptionsMain.writeAutoSubs = true;
        ytDlpOptionsMain.subLangs = 'en.*,id.*';
        ytDlpOptionsMain.embedSubs = true;
      }

      const ytDlpOptionsBroll: any = {
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
        downloadSections: `*0-${duration}`,
        forceKeyframesAtCuts: true,
        ffmpegLocation: ffmpegPath,
        output: brollVideoPath,
        noPlaylist: true,
        ignoreErrors: true,
      };

      try {
        await Promise.all([
          ytdlp.exec(url, ytDlpOptionsMain),
          ytdlp.exec(brollUrl, ytDlpOptionsBroll)
        ]);
      } catch (e: any) {
        console.error("yt-dlp error during split-screen:", e);
      }

      if (!fs.existsSync(mainVideoPath) || !fs.existsSync(brollVideoPath)) {
        if (fs.existsSync(mainVideoPath)) fs.unlinkSync(mainVideoPath);
        if (fs.existsSync(brollVideoPath)) fs.unlinkSync(brollVideoPath);
        return NextResponse.json({ error: "Failed to download main or B-Roll video." }, { status: 500 });
      }

      try {
        await execa(ffmpegPath, [
          "-i", mainVideoPath,
          "-i", brollVideoPath,
          "-filter_complex", "[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[top];[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960[bottom];[top][bottom]vstack=inputs=2[v]",
          "-map", "[v]",
          "-map", "0:a?",
          finalOutputPath
        ]);
      } catch (e: any) {
        console.error("ffmpeg merge error:", e);
        return NextResponse.json({ error: "Failed to merge B-Roll." }, { status: 500 });
      } finally {
        if (fs.existsSync(mainVideoPath)) fs.unlinkSync(mainVideoPath);
        if (fs.existsSync(brollVideoPath)) fs.unlinkSync(brollVideoPath);
      }
      
      outputPath = finalOutputPath;

    } else {
      const ytDlpOptions: any = {
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
        downloadSections: `*${startSeconds}-${endSeconds}`,
        forceKeyframesAtCuts: true,
        ffmpegLocation: ffmpegPath,
        output: outputPath,
        noPlaylist: true,
        ignoreErrors: true,
      };

      if (aspectRatio !== "original") {
        let cropFilter = "";
        if (aspectRatio === "9:16") cropFilter = 'crop=trunc(min(iw\\,ih*9/16)/2)*2:trunc(min(ih\\,iw*16/9)/2)*2';
        else if (aspectRatio === "4:3") cropFilter = 'crop=trunc(min(iw\\,ih*4/3)/2)*2:trunc(min(ih\\,iw*3/4)/2)*2';
        else if (aspectRatio === "1:1") cropFilter = 'crop=trunc(min(iw\\,ih)/2)*2:trunc(min(ih\\,iw)/2)*2';
        
        if (cropFilter) {
          ytDlpOptions.downloaderArgs = `ffmpeg:-vf "${cropFilter}" -c:v libx264`;
        }
      }

      if (includeSubtitles) {
        ytDlpOptions.writeAutoSubs = true;
        ytDlpOptions.subLangs = 'en.*,id.*';
        ytDlpOptions.embedSubs = true;
      }

      let stderrStr = "";
      try {
        const { stderr } = await ytdlp.exec(url, ytDlpOptions);
        stderrStr = stderr || "";
      } catch (e: any) {
        console.error("yt-dlp error:", e);
        stderrStr = (e && e.stderr) ? String(e.stderr) : "";
        const isSubtitleError = stderrStr.includes("Unable to download video subtitles") || stderrStr.includes("HTTP Error 429");
        
        if (!(isSubtitleError && fs.existsSync(outputPath))) {
          let errorMessage = "Failed to download clip. Ensure the URL is valid and the video is public.";
          if (e && typeof e === 'object') {
              errorMessage = e.stderr || e.shortMessage || e.message || JSON.stringify(e, Object.getOwnPropertyNames(e));
          } else if (e) {
              errorMessage = String(e);
          }
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
      }

      const isSubtitleError = stderrStr.includes("Unable to download video subtitles") || stderrStr.includes("HTTP Error 429");
      if (isSubtitleError && fs.existsSync(outputPath)) {
        console.warn("Subtitle download failed, but video downloaded successfully.");
        subtitleWarning = true;
      }
    }

    if (!fs.existsSync(outputPath)) {
      return NextResponse.json({ error: "Failed to generate clip." }, { status: 500 });
    }

    const stat = fs.statSync(outputPath);
    const fileStream = fs.createReadStream(outputPath);

    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk: any) => controller.enqueue(new Uint8Array(chunk)));
        fileStream.on('end', () => {
          controller.close();
          fs.unlink(outputPath, () => {});
        });
        fileStream.on('error', (err: any) => {
          controller.error(err);
          fs.unlink(outputPath, () => {});
        });
      },
      cancel() {
        fileStream.destroy();
        fs.unlink(outputPath, () => {});
      }
    });

    const headers: Record<string, string> = {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size.toString(),
      "Content-Disposition": `attachment; filename="clip_${sessionId}.mp4"`,
    };

    if (subtitleWarning) {
      headers["X-Subtitle-Warning"] = "true";
    }

    return new NextResponse(stream, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error("Clip error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}

