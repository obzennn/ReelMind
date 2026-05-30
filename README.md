<div align="center">
  <h1>🧠 ReelMind V3</h1>
  <p><strong>The Personal Faceless Channel Automation Bot</strong></p>
  <p>Turn boring 1-hour podcasts into highly viral TikToks & YouTube Shorts using AI-powered video analysis, Automated B-Roll Compositing, and Stealth Auto-Publishing.</p>
</div>

---

## ✨ Features

- 🧠 **AI Viral Brain**: Powered by Gemini/GPT-4 via **OpenRouter**. ReelMind reads the raw `.json3` subtitles of any YouTube video, mathematically analyzing the transcript to extract the most engaging 60-second hooks (strictly enforcing an 80+ virality score).
- 🎙️ **Viral Animated Captions (Whisper API)**: Completely replaces boring static subtitles. Extracts the clip audio, runs it through OpenAI Whisper with word-level granularities, and generates advanced `.ass` overlays to burn TikTok-style word-by-word yellow highlighted captions into the final render.
- ✂️ **Precision Local Clipper & Trimmer**: Zero expensive cloud rendering fees. ReelMind uses a robust local `FFmpeg` pipeline to slice and format your videos into a perfect `9:16` aspect ratio instantly. Includes an **Interactive Web Trimmer** to let you manually tweak the AI's suggested start/end times before rendering.
- 🎵 **Auto-BGM (Background Music)**: Automatically mixes background music (e.g., Lo-Fi, Phonk) into your clips. Just drop a `bgm.mp3` file into the `public/` directory and ReelMind will blend it underneath the podcast audio.
- 🕵️ **Reused Content Bypass (Auto B-Roll)**: Beat the algorithm. ReelMind's auto-split-screen engine seamlessly overlays satisfying background footage (e.g., *Subway Surfers, Minecraft Parkour*) underneath your podcast, creating a completely new pixel hash to bypass YouTube and TikTok's demonetization filters.
- 🚀 **Stealth Auto-Publishers**: Fully automated social media distribution.
  - **YouTube Shorts API**: Uploads directly to YouTube using the official `googleapis` OAuth integration.
  - **TikTok Stealth Bot**: Bypasses TikTok's strict API limitations using a headless Microsoft **Playwright** script (`scripts/tiktok-bot.js`) that logs in via cookies and uploads your video like a real human.

## 🚀 Getting Started

### Prerequisites
Before running ReelMind, ensure you have the following installed on your local machine:
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
   Create a `.env` file and insert your API Keys:
   ```env
   # Required: For Video Analysis (Gemini/GPT-4o)
   OPENROUTER_API_KEY="sk-or-v1-YOUR-KEY-HERE"
   
   # Required: For Word-by-Word Animated Captions
   OPENAI_API_KEY="sk-proj-YOUR-KEY-HERE"

   # Optional: For YouTube Shorts Auto-Publish
   YOUTUBE_CLIENT_ID="your-client-id"
   YOUTUBE_CLIENT_SECRET="your-client-secret"
   YOUTUBE_REDIRECT_URI="http://localhost:3000"
   YOUTUBE_REFRESH_TOKEN="your-refresh-token"
   ```

4. **TikTok Bot First-Time Setup**
   To use the TikTok Auto-Publisher, you must generate a session cookie first:
   - Temporarily edit `scripts/tiktok-bot.js` and set `headless: false`.
   - Run the script manually: `node scripts/tiktok-bot.js ./test.mp4 "Title" "Desc" "#shorts"`
   - Scan the TikTok login QR code in the browser window that pops up.
   - Close the browser. The session is now saved in `.tiktok_session`. You can set `headless: true` again.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action.

## 🛠️ Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS. Stripped of all SaaS bloat for maximum personal performance.
- **Backend API**: Next.js Route Handlers.
- **AI Integrations**: Vercel AI SDK + OpenRouter.
- **Video Engine**: `yt-dlp-exec`, `execa`, and `FFmpeg` (`-filter_complex` for advanced vertical stacking and `amix` for audio).
- **Automation**: Playwright (TikTok) & Google APIs (YouTube).

---
*Disclaimer: ReelMind is an independent open-source tool. Please respect YouTube's Terms of Service, TikTok's automation policies, and original creators' copyrights when utilizing the clipping engine.*
