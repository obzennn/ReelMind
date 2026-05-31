import React from "react";
import { ClipCard } from "@/components/ClipCard";

interface ClipDashboardProps {
  clips: any[];
  setClips: React.Dispatch<React.SetStateAction<any[]>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  aspectRatio: string;
  setAspectRatio: React.Dispatch<React.SetStateAction<string>>;
  includeSubtitles: boolean;
  setIncludeSubtitles: React.Dispatch<React.SetStateAction<boolean>>;
  brollEnabled: boolean;
  setBrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  brollUrl: string;
  setBrollUrl: React.Dispatch<React.SetStateAction<string>>;
  handleGenerate: (clip: any) => Promise<void>;
  loading: boolean;
  loadingStep: number;
  error: string;
  warning: string;
  formatTime: (seconds: number) => string;
}

export const ClipDashboard: React.FC<ClipDashboardProps> = ({
  clips,
  setClips,
  setStep,
  aspectRatio,
  setAspectRatio,
  includeSubtitles,
  setIncludeSubtitles,
  brollEnabled,
  setBrollEnabled,
  brollUrl,
  setBrollUrl,
  handleGenerate,
  loading,
  loadingStep,
  error,
  warning,
  formatTime,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Clip Dashboard</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Select an AI-suggested clip to generate.</p>
        </div>
        <button
          onClick={() => {
            setStep(1);
            setClips([]);
          }}
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
              includeSubtitles ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out ${
                includeSubtitles ? "translate-x-5" : "translate-x-0"
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
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Add satisfying split-screen footage to increase retention
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={brollEnabled}
            onClick={() => setBrollEnabled(!brollEnabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
              brollEnabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out ${
                brollEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {brollEnabled && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 mb-2 block">
              Select Background Footage
            </label>
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
          <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-3">
            No highly viral moments found in this video (Score &gt; 80).
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md text-sm md:text-base">
            Our AI analyzed the video but couldn't find any segments that meet the high virality threshold. Try analyzing a different video.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setClips([]);
            }}
            className="px-6 py-3 md:py-4 md:px-8 rounded-xl text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold tracking-wide transition-colors shadow-sm"
          >
            Try Another Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {clips.map((clip, idx) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              idx={idx}
              clips={clips}
              setClips={setClips}
              formatTime={formatTime}
              handleGenerate={handleGenerate}
              loading={loading}
              loadingStep={loadingStep}
            />
          ))}
        </div>
      )}
    </div>
  );
};
