import React from "react";

interface VideoInputProps {
  url: string;
  setUrl: (url: string) => void;
  handleAnalyze: () => void;
  analyzing: boolean;
  error: string;
}

export const VideoInput: React.FC<VideoInputProps> = ({ url, setUrl, handleAnalyze, analyzing, error }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 md:p-16 rounded-2xl relative animate-in fade-in slide-in-from-bottom-8 overflow-hidden shadow-sm dark:shadow-none">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight text-zinc-900 dark:text-white">
        YouTube Clipper
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-center mb-10 text-lg">
        Extract the perfect moment. Fast, precise, and beautiful.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1 mb-2 block">YouTube URL</label>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`w-full p-4 md:p-5 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-zinc-400 dark:focus:border-zinc-500`}
          />
        </div>

        {error && (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
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
  );
};
