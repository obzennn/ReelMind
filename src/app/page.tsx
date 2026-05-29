"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const LOADING_STEPS = [
  "Fetching video...",
  "Applying crop and re-encoding...",
  "Finalizing clip..."
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [includeSubtitles, setIncludeSubtitles] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("original");
  const [credits, setCredits] = useState(600);
  const [brollEnabled, setBrollEnabled] = useState(false);
  const [brollUrl, setBrollUrl] = useState("https://www.youtube.com/watch?v=n_Dv4JMiwK8");
  
  // Step 2 state
  const [step, setStep] = useState(1);
  const [clips, setClips] = useState<any[]>([]);

  const handleAnalyze = async () => {
    setError("");
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

    if (!url || !ytRegex.test(url)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    setAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze video.");
      }

      const data = await response.json();
      setClips(data.clips || []);
      setCredits((prev) => Math.max(0, prev - 300));
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleGenerate = async (clip: any) => {
    setError("");
    setWarning("");
    
    setLoading(true);
    setLoadingStep(0);

    const loadingInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 4000);

    try {
      const startTime = formatTime(clip.startTime);
      const endTime = formatTime(clip.endTime);

      const response = await fetch("/api/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, startTime, endTime, includeSubtitles, aspectRatio, brollEnabled, brollUrl })
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate clip";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          errorMessage = `Failed to generate clip (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      if (response.headers.get("X-Subtitle-Warning") === "true") {
        setWarning("Video clipped successfully, but subtitles failed to download due to YouTube rate limits.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      
      a.download = `clip_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(loadingInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 md:px-8 py-8 relative overflow-y-auto bg-zinc-50 dark:bg-black transition-colors duration-300">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 flex items-center gap-4">
        <div className={`text-sm font-medium border px-3 py-1 rounded-full ${credits === 0 ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-950/50' : credits <= 300 ? 'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950'}`}>
          Credits: {credits}
        </div>
        <ThemeToggle />
      </div>
      <div className={`mt-10 mb-20 w-full ${step === 1 ? 'max-w-2xl' : 'max-w-6xl'} relative z-10 transition-all duration-700`}>
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 md:p-16 rounded-2xl relative animate-in fade-in slide-in-from-bottom-8 overflow-hidden shadow-sm dark:shadow-none">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight text-zinc-900 dark:text-white">
              YouTube Clipper
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-10 text-lg">
              Extract the perfect moment. Fast, precise, and beautiful.
            </p>

            <div className="space-y-6">
              {credits <= 300 && credits > 0 && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Low API Credits. You have enough for 1 more video.</p>
                </div>
              )}
              {credits === 0 && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Out of API Credits. Please top up your OpenAI/Gemini account.</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 mb-2 block">YouTube URL</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={credits === 0}
                  className={`w-full p-4 md:p-5 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 ${credits === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {error && (
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={analyzing || credits === 0}
                className="w-full py-4 md:py-5 rounded-xl text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold tracking-wide mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-sm"
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing video...</span>
                  </div>
                ) : (
                  "Analyze Video"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Clip Dashboard</h2>
                <p className="text-zinc-600 dark:text-zinc-400">Select an AI-suggested clip to generate.</p>
              </div>
              <button 
                onClick={() => { setStep(1); setClips([]); }}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                ← Back to URL
              </button>
            </div>

            {/* Global Options */}
            <div className="p-6 md:p-8 rounded-2xl mb-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
               <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 mb-2 block">Aspect Ratio</label>
                <div className="flex gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  {["original", "9:16", "4:3", "1:1"].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 py-2 md:py-2.5 text-sm font-medium rounded-lg transition-all ${
                        aspectRatio === ratio
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm dark:shadow-none border border-zinc-200 dark:border-transparent"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {ratio === "original" ? "Original" : ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between p-5 md:p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full">
                <div>
                  <p className="text-zinc-900 dark:text-white font-medium">Enable Viral Animated Captions (Whisper AI)</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Embed English/Indonesian subtitles</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeSubtitles}
                  onClick={() => setIncludeSubtitles(!includeSubtitles)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                    includeSubtitles ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out ${
                      includeSubtitles ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* B-Roll Options */}
            <div className="p-6 md:p-8 rounded-2xl mb-10 flex flex-col gap-6 md:gap-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-zinc-900 dark:text-white font-medium text-lg">Algorithm Bypass (B-Roll)</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Add satisfying split-screen footage to increase retention</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={brollEnabled}
                  onClick={() => setBrollEnabled(!brollEnabled)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                    brollEnabled ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out ${
                      brollEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {brollEnabled && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 mb-2 block">Select Background Footage</label>
                  <select
                    value={brollUrl}
                    onChange={(e) => setBrollUrl(e.target.value)}
                    className="w-full p-4 rounded-xl text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 appearance-none"
                  >
                    <option value="https://www.youtube.com/watch?v=n_Dv4JMiwK8">Minecraft Parkour</option>
                    <option value="https://www.youtube.com/watch?v=sI9OpIu_hI8">Subway Surfers</option>
                    <option value="https://www.youtube.com/watch?v=8VzGXYOQOUM">ASMR Kinetic Sand</option>
                  </select>
                </div>
              )}
            </div>

            {error && (
              <div className="flex flex-col gap-3 p-4 mb-8 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {warning && (
              <div className="flex flex-col gap-3 p-4 mb-8 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-900 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{warning}</p>
              </div>
            )}

            {clips.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 md:p-16 text-center animate-in fade-in zoom-in-95 duration-500 shadow-sm dark:shadow-none">
                <div className="text-6xl mb-4 animate-bounce">🤖</div>
                <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-3">No highly viral moments found in this video (Score &gt; 80).</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md text-sm md:text-base">Our AI analyzed the video but couldn't find any segments that meet the high virality threshold. Try analyzing a different video.</p>
                <button
                  onClick={() => { setStep(1); setClips([]); }}
                  className="px-6 py-3 md:py-4 md:px-8 rounded-xl text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold tracking-wide transition-colors shadow-sm"
                >
                  Try Another Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {clips.map((clip, idx) => (
                  <div key={clip.id} className="relative flex flex-col bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-none">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 px-3 md:px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                      <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex items-center gap-1 text-sm font-mono text-zinc-700 dark:text-zinc-300">
                        <input 
                          type="text" 
                          value={clip.customStartTime ?? formatTime(clip.startTime)}
                          onChange={(e) => {
                            const newClips = [...clips];
                            newClips[idx].customStartTime = e.target.value;
                            setClips(newClips);
                          }}
                          onBlur={(e) => {
                            const parts = e.target.value.split(":");
                            if(parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
                              const newClips = [...clips];
                              newClips[idx].startTime = parseInt(parts[0])*60 + parseInt(parts[1]);
                              setClips(newClips);
                            }
                          }}
                          className="w-[45px] bg-transparent text-center border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                        />
                        <span className="text-zinc-400">-</span>
                        <input 
                          type="text" 
                          value={clip.customEndTime ?? formatTime(clip.endTime)}
                          onChange={(e) => {
                            const newClips = [...clips];
                            newClips[idx].customEndTime = e.target.value;
                            setClips(newClips);
                          }}
                          onBlur={(e) => {
                            const parts = e.target.value.split(":");
                            if(parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
                              const newClips = [...clips];
                              newClips[idx].endTime = parseInt(parts[0])*60 + parseInt(parts[1]);
                              setClips(newClips);
                            }
                          }}
                          className="w-[45px] bg-transparent text-center border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                        />
                      </div>
                    </div>
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 ${clip.viralityScore > 90 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' : clip.viralityScore > 80 ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'}`}>
                      <span className="text-sm font-bold">{clip.viralityScore}</span>
                      <span className="text-[10px] leading-none opacity-80">Score</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight">{clip.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 flex-1 line-clamp-3 leading-relaxed">{clip.description}</p>

                  <button
                    onClick={() => handleGenerate(clip)}
                    disabled={loading}
                    className="w-full py-3 md:py-4 rounded-xl text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative overflow-hidden shadow-sm"
                  >
                    {loading ? (
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="relative z-10">Generate Clip</span>
                    )}
                    {loading && (
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-white/20 dark:bg-black/20 transition-all duration-1000 ease-out z-0"
                        style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                      />
                    )}
                  </button>

                  <button
                    onClick={() => alert("Simulating Auto-Publish to TikTok API... (Requires NextAuth User Session)")}
                    className="w-full py-2.5 mt-3 md:py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-black dark:to-zinc-900 hover:opacity-90 font-bold tracking-wide transition-colors relative overflow-hidden shadow-sm text-sm flex justify-center items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                    </svg>
                    Publish to TikTok
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
