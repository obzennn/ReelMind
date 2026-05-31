import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import OpenAI from "openai";
import { 
  cleanupOldTempFiles, 
  parseTimestampToSeconds, 
  YOUTUBE_URL_REGEX,
  getFfmpegPath
} from "@/utils/ffmpegUtils";
import {
  processBrollVideo,
  processStandardVideo,
} from "@/utils/ffmpegProcess";

export async function POST(req: NextRequest) {
  cleanupOldTempFiles(os.tmpdir(), 1);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
  });
  
  const ffmpegPath = getFfmpegPath();

  try {
    const body = await req.json();
    const { url, startTime, endTime, brollUrl } = body;
    const includeSubtitles = Boolean(body.includeSubtitles);
    const aspectRatio = body.aspectRatio || "original";
    const brollEnabled = Boolean(body.brollEnabled);
    const captionsEnabled = Boolean(body.captionsEnabled);

    if (!url || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!YOUTUBE_URL_REGEX.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const startSeconds = parseTimestampToSeconds(startTime);
    const endSeconds = parseTimestampToSeconds(endTime);

    if (startSeconds === null || endSeconds === null || startSeconds >= endSeconds) {
      return NextResponse.json({ error: "Invalid timestamps" }, { status: 400 });
    }
    
    const duration = endSeconds - startSeconds;
    if (duration > 600) {
      return NextResponse.json({ error: "Clip duration cannot exceed 10 minutes." }, { status: 400 });
    }

    if (!ffmpegPath) {
      return NextResponse.json({ error: "Server config error: ffmpeg missing." }, { status: 500 });
    }

    const tempDir = os.tmpdir();
    const sessionId = Math.random().toString(36).substring(7);
    
    let outputPath = "";
    let subtitleWarning = false;

    if (brollEnabled && brollUrl) {
      outputPath = await processBrollVideo({
        url, brollUrl, startSeconds, endSeconds, duration, includeSubtitles, captionsEnabled, tempDir, sessionId, openai
      });
    } else {
      const result = await processStandardVideo({
        url, startSeconds, endSeconds, includeSubtitles, captionsEnabled, aspectRatio, tempDir, sessionId, openai
      });
      outputPath = result.outputPath;
      subtitleWarning = result.subtitleWarning;
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

    return new NextResponse(stream, { status: 200, headers });

  } catch (error: any) {
    console.error("Clip error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
