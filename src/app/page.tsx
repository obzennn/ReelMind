"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VideoInput } from "@/components/VideoInput";
import { ClipDashboard } from "@/components/ClipDashboard";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [includeSubtitles, setIncludeSubtitles] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("original");
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
        <ThemeToggle />
      </div>
      <div className={`mt-10 mb-20 w-full ${step === 1 ? 'max-w-2xl' : 'max-w-6xl'} relative z-10 transition-all duration-700`}>
        {step === 1 && (
          <VideoInput
            url={url}
            setUrl={setUrl}
            handleAnalyze={handleAnalyze}
            analyzing={analyzing}
            error={error}
          />
        )}

        {step === 2 && (
          <ClipDashboard
            clips={clips}
            setClips={setClips}
            setStep={setStep}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            includeSubtitles={includeSubtitles}
            setIncludeSubtitles={setIncludeSubtitles}
            brollEnabled={brollEnabled}
            setBrollEnabled={setBrollEnabled}
            brollUrl={brollUrl}
            setBrollUrl={setBrollUrl}
            handleGenerate={handleGenerate}
            loading={loading}
            loadingStep={loadingStep}
            error={error}
            warning={warning}
            formatTime={formatTime}
          />
        )}
      </div>
    </main>
  );
}
