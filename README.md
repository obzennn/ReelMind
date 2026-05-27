<div align="center">
  <h1>🧠 ReelMind</h1>
  <p><strong>The Ultimate Open-Source OpusClip Clone</strong></p>
  <p>Turn boring 1-hour podcasts into highly viral TikToks & YouTube Shorts using AI-powered video analysis and Automated B-Roll Compositing.</p>
</div>

---

## ✨ Features

- 🧠 **AI Viral Brain**: Powered by Gemini/GPT-4 via **OpenRouter**. ReelMind reads the raw `.json3` subtitles of any YouTube video, mathematically analyzing the transcript to extract the most engaging 60-second hooks (strictly enforcing an 80+ virality score).
- ✂️ **Precision Local Clipper**: Zero expensive cloud rendering fees. ReelMind uses a robust local `FFmpeg` pipeline to slice and format your videos into a perfect `9:16` aspect ratio instantly.
- 🕵️ **Reused Content Bypass (Auto B-Roll)**: Beat the algorithm. ReelMind's auto-split-screen engine seamlessly overlays satisfying background footage (e.g., *Subway Surfers, Minecraft Parkour*) underneath your podcast, creating a completely new pixel hash to bypass YouTube and TikTok's demonetization filters.
- 💎 **Ultra-Minimalist SaaS UI**: A premium, high-contrast dark/light mode interface inspired by modern tools like Vercel and Linear. No cheap neon glows—just crisp 1px borders and mathematically perfect typography.
- 🔋 **API Credit Protection**: Built-in 2-Tier Mock Quota Warning system. Protects your backend from crashing into `402 Payment Required` or `429 Too Many Requests` when your AI tokens run low.

## 🚀 Getting Started

### Prerequisites
Before running ReelMind, ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher)
- **FFmpeg** (Must be added to your system PATH)
- **yt-dlp** (Must be added to your system PATH)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/obzennn/ReelMind.git
   cd ReelMind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the AI Brain**
   Rename the `.env.example` file to `.env.local` and insert your OpenRouter API Key:
   ```env
   OPENROUTER_API_KEY="sk-or-v1-YOUR-KEY-HERE"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action.

## 🛠️ Architecture
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Next-Themes.
- **Backend API**: Next.js Route Handlers.
- **AI Integrations**: Vercel AI SDK + OpenRouter.
- **Video Engine**: `yt-dlp-exec`, `execa`, and `FFmpeg` (`-filter_complex` for advanced vertical stacking).

---
*Disclaimer: ReelMind is an independent open-source tool. Please respect YouTube's Terms of Service and original creators' copyrights when utilizing the clipping engine.*
