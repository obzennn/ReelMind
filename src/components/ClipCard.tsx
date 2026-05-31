import React from "react";

interface ClipCardProps {
  clip: any;
  idx: number;
  clips: any[];
  setClips: React.Dispatch<React.SetStateAction<any[]>>;
  formatTime: (seconds: number) => string;
  handleGenerate: (clip: any) => Promise<void>;
  loading: boolean;
  loadingStep: number;
}

export const ClipCard: React.FC<ClipCardProps> = ({
  clip,
  idx,
  clips,
  setClips,
  formatTime,
  handleGenerate,
  loading,
  loadingStep,
}) => {
  const LOADING_STEPS = ["Fetching video...", "Applying crop and re-encoding...", "Finalizing clip..."];

  return (
    <div className="relative flex flex-col bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-none">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-zinc-50 dark:bg-zinc-900 px-3 md:px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-zinc-500 dark:text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
                if (parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
                  const newClips = [...clips];
                  newClips[idx].startTime = parseInt(parts[0]) * 60 + parseInt(parts[1]);
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
                if (parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
                  const newClips = [...clips];
                  newClips[idx].endTime = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                  setClips(newClips);
                }
              }}
              className="w-[45px] bg-transparent text-center border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
            />
          </div>
        </div>
        <div
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 ${
            clip.viralityScore > 90
              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
              : clip.viralityScore > 80
              ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400"
          }`}
        >
          <span className="text-sm font-bold">{clip.viralityScore}</span>
          <span className="text-[10px] leading-none opacity-80">Score</span>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight">{clip.title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 flex-1 line-clamp-3 leading-relaxed">
        {clip.description}
      </p>

      <button
        onClick={() => handleGenerate(clip)}
        disabled={loading}
        className="w-full py-3 md:py-4 rounded-xl text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative overflow-hidden shadow-sm"
      >
        {loading ? (
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
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
        onClick={() => alert("Launching TikTok Playwright Stealth Bot...")}
        className="w-full py-2.5 mt-3 md:py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-black dark:to-zinc-900 hover:opacity-90 font-bold tracking-wide transition-colors relative overflow-hidden shadow-sm text-sm flex justify-center items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor">
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
        </svg>
        Publish to TikTok
      </button>
    </div>
  );
};
