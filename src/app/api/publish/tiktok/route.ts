import { NextRequest, NextResponse } from "next/server";
import { execa } from "execa";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { videoPath, title, description, tags } = await req.json();

    if (!videoPath || !fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "Video file not found." }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", "tiktok-bot.js");

    // Spawn the playwright bot asynchronously
    // In a real production setup, you'd want to use a job queue like BullMQ
    execa("node", [scriptPath, videoPath, title, description, tags]).catch(err => {
        console.error("TikTok bot background process failed:", err);
    });

    return NextResponse.json({ success: true, message: "TikTok bot launched in the background. Check server console for logs." });
  } catch (error: any) {
    console.error("TikTok route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
