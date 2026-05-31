# ReelMind V3

ReelMind is a video processing automation tool that extracts clips from YouTube videos and formats them for short-form video platforms like TikTok, YouTube Shorts, and Instagram Reels. It utilizes AI for transcript analysis and local FFmpeg processes for video rendering and captioning.

---

## Features

- **Video Analysis**: Uses Gemini via OpenRouter to analyze YouTube `.json3` subtitle transcripts. The AI identifies 15-60 second segments based on a predefined engagement scoring prompt.
- **Automated Captions**: Extracts audio and processes it using the OpenAI Whisper API to generate word-level timestamps. These timestamps are converted into `.ass` subtitle files and burned into the video.
- **Local Rendering Pipeline**: Utilizes local `FFmpeg` to process videos without relying on cloud rendering services. Supports cropping to a `9:16` aspect ratio and provides a web interface for manual adjustment of start and end times.
- **Background Audio Mixing**: Supports mixing an optional background audio track (`public/bgm.mp3`) underneath the primary video audio.
- **Split-Screen Compositing**: Includes an option to overlay the primary video on top of secondary background footage (e.g., gameplay videos) to create a vertically stacked layout.
- **Publishing Integrations**: 
  - **YouTube Shorts**: Integrates with the official `googleapis` OAuth for direct uploading.
  - **TikTok**: Includes a headless Microsoft Playwright script (`scripts/tiktok-bot.js`) that uses session cookies to automate the upload process.

## Getting Started

### Prerequisites
Ensure you have the following installed on your local machine before running ReelMind:
- **Node.js** (v18 or higher)
- **FFmpeg** (Must be added to your system PATH)
- **yt-dlp** (Must be added to your system PATH)
- **Playwright Browsers** (Run `npx playwright install` after `npm install`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/obzennn/ReelMind.git
   cd ReelMind
   ```

2. **Install dependencies**
   ```bash
   npm install
   npx playwright install chromium
   ```

3. **Configure the Environment**
   Create a `.env.local` file and insert your required API keys:
   ```env
   # Required: For Video Transcript Analysis (OpenRouter)
   OPENROUTER_API_KEY="sk-or-v1-YOUR-KEY-HERE"
   
   # Required: For Whisper API Audio Transcription
   OPENAI_API_KEY="sk-proj-YOUR-KEY-HERE"

   # Optional: For YouTube Shorts Auto-Publish
   YOUTUBE_CLIENT_ID="your-client-id"
   YOUTUBE_CLIENT_SECRET="your-client-secret"
   YOUTUBE_REDIRECT_URI="http://localhost:3000"
   YOUTUBE_REFRESH_TOKEN="your-refresh-token"
   ```

4. **TikTok Automation Setup**
   If you plan to use the TikTok publisher script, you need to generate a session cookie:
   - Edit `scripts/tiktok-bot.js` and temporarily set `headless: false`.
   - Run the script manually: `node scripts/tiktok-bot.js ./test.mp4 "Title" "Desc" "#shorts"`
   - Scan the TikTok login QR code in the browser window.
   - Close the browser. The session cookie is saved in `.tiktok_session`. You can restore `headless: true`.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to access the interface.

## Architecture
- **Frontend**: Next.js 14 (App Router) with Tailwind CSS.
- **Backend API**: Next.js Route Handlers.
- **Video Engine**: Uses `yt-dlp-exec`, `execa`, and `FFmpeg` (`-filter_complex` for stacking and `amix` for audio routing).
- **Automation**: Playwright for browser automation and Google APIs for OAuth integrations.

---
*Disclaimer: ReelMind is an independent open-source project. Users are responsible for complying with the Terms of Service of YouTube, TikTok, and other platforms, as well as respecting copyright laws when downloading and processing videos.*
