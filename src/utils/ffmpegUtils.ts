import fs from "fs";
import path from "path";
import os from "os";
import { create as createYtDlp } from "yt-dlp-exec";

const isWin = os.platform() === "win32";

export function cleanupOldTempFiles(dir: string, maxAgeHours: number = 1) {
  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();
    for (const file of files) {
      if (file.match(/^(clip|main|broll|raw|audio|subs|final)_.*\.(mp4|mp3|ass)$/)) {
        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > maxAgeHours * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {}
      }
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

export function parseTimestampToSeconds(ts: string): number | null {
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

export const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

export function getYtDlp() {
  return createYtDlp(
    path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", isWin ? "yt-dlp.exe" : "yt-dlp")
  );
}

export function getFfmpegPath() {
  let ffmpegPath = "";
  try {
    require("ffmpeg-static");
    ffmpegPath = path.join(process.cwd(), "node_modules", "ffmpeg-static", isWin ? "ffmpeg.exe" : "ffmpeg");
  } catch (e) {
    console.warn("ffmpeg-static not found");
  }
  return ffmpegPath;
}
