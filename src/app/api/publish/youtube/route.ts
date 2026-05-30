import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { videoPath, title, description, tags } = await req.json();

    if (!videoPath || !fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "Video file not found." }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    // Provide the refresh token securely in your .env.local
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const fileSize = fs.statSync(videoPath).size;

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title,
          description: description + "\n#shorts",
          tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
        },
        status: {
          privacyStatus: "private", // Set to 'public' for actual auto-publish
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    });

    return NextResponse.json({ success: true, videoId: res.data.id });
  } catch (error: any) {
    console.error("YouTube upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
