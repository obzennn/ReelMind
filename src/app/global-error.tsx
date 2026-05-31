"use client";

import { GlobalErrorUI } from "@/components/GlobalErrorUI";
import { KEYFRAMES } from "@/components/BrokenFilmIcon";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorText = [
    error.message || "Unknown error",
    error.digest ? `\nDigest: ${error.digest}` : "",
    error.stack ? `\n\n${error.stack}` : "",
  ].join("");

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      </head>
      <GlobalErrorUI errorText={errorText} />
    </html>
  );
}
