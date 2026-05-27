"use client";

import { useState } from "react";

/**
 * Global Error Fallback — Section 4.10 of design_spec.md
 *
 * This component renders when a root-level error occurs in the Next.js
 * App Router. It is intentionally self-contained with ZERO external CSS
 * or Tailwind dependencies so it can display even when the JS/CSS
 * bundle itself fails to compile.
 *
 * It renders its own <html> and <body> tags as required by Next.js
 * global-error convention.
 */

/* ------------------------------------------------------------------ */
/*  Inline style objects — keeps component zero-dependency             */
/* ------------------------------------------------------------------ */

const GRADIENT_BG: React.CSSProperties = {
  background: "linear-gradient(to bottom right, #0F172A, #020617)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily:
    "'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
};

const GLASS_CARD: React.CSSProperties = {
  maxWidth: 480,
  width: "100%",
  background: "rgba(255, 255, 255, 0.06)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 24,
  boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.6)",
  padding: "40px 32px 32px",
  textAlign: "center" as const,
  /* animation handled via keyframes injected below */
  animation: "cardEntrance 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
};

const HEADING: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#FFFFFF",
  margin: "20px 0 8px",
  lineHeight: 1.3,
};

const SUBTEXT: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  color: "#94A3B8",
  margin: "0 0 28px",
  lineHeight: 1.6,
};

const BTN_PRIMARY: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg, #FF3366 0%, #FF9933 100%)",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s, filter 0.2s",
};

const BTN_SECONDARY: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 12,
  background: "transparent",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "background 0.2s",
  marginTop: 12,
};

const DETAILS_TOGGLE: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#94A3B8",
  fontSize: 13,
  cursor: "pointer",
  marginTop: 24,
  padding: 0,
  transition: "color 0.2s",
};

const TERMINAL_BOX: React.CSSProperties = {
  position: "relative" as const,
  marginTop: 12,
  background: "#020617",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: 8,
  boxShadow: "inset 0 4px 6px rgba(0, 0, 0, 0.5)",
  maxHeight: 250,
  overflowY: "auto" as const,
  textAlign: "left" as const,
};

const TERMINAL_TEXT: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  fontSize: 12,
  lineHeight: 1.6,
  color: "#FCA5A5",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
  margin: 0,
  padding: "16px",
};

const COPY_BTN: React.CSSProperties = {
  position: "absolute" as const,
  top: 8,
  right: 8,
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 6,
  color: "#94A3B8",
  fontSize: 11,
  padding: "4px 10px",
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s",
};

/* ------------------------------------------------------------------ */
/*  Keyframe CSS — injected as a <style> tag inside <head>             */
/* ------------------------------------------------------------------ */

const KEYFRAMES = `
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes iconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.7));
  }
}
`;

/* ------------------------------------------------------------------ */
/*  Icon — inline SVG "broken film strip"                              */
/* ------------------------------------------------------------------ */

function BrokenFilmIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "iconPulse 3s ease-in-out infinite" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="iconGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* Film strip body */}
      <rect x="8" y="6" width="40" height="44" rx="4" stroke="url(#iconGrad)" strokeWidth="2.5" fill="none" />
      {/* Sprocket holes left */}
      <rect x="12" y="12" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="12" y="22" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="12" y="32" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="12" y="42" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      {/* Sprocket holes right */}
      <rect x="39" y="12" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="22" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="32" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="42" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      {/* Crack / break line */}
      <line x1="18" y1="18" x2="38" y2="38" stroke="url(#iconGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
      <line x1="22" y1="14" x2="36" y2="42" stroke="url(#iconGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" strokeDasharray="2 4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorText = [
    error.message || "Unknown error",
    error.digest ? `\nDigest: ${error.digest}` : "",
    error.stack ? `\n\n${error.stack}` : "",
  ].join("");

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
    } catch {
      /* noop */
    }
    try {
      sessionStorage.clear();
    } catch {
      /* noop */
    }
    window.location.href = window.location.href;
  };

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may not be available */
    }
  };

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      </head>
      <body style={GRADIENT_BG}>
        <div style={GLASS_CARD}>
          {/* Icon */}
          <BrokenFilmIcon />

          {/* Heading */}
          <h1 style={HEADING}>Something Went Wrong</h1>

          {/* Subtext */}
          <p style={SUBTEXT}>
            The app ran into a build error. This is usually caused by a stale
            cache and is easy to fix.
          </p>

          {/* Primary Action */}
          <button
            type="button"
            style={BTN_PRIMARY}
            onClick={handleRefresh}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 10px 20px -5px rgba(255, 51, 102, 0.4)";
              e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.filter = "none";
            }}
          >
            Refresh Page
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            style={BTN_SECONDARY}
            onClick={handleClearCache}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Clear Cache &amp; Reload
          </button>

          {/* Collapsible Details */}
          <button
            type="button"
            style={DETAILS_TOGGLE}
            onClick={() => setShowDetails((v) => !v)}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.color = "#CBD5E1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
              e.currentTarget.style.color = "#94A3B8";
            }}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>

          {showDetails && (
            <div style={TERMINAL_BOX}>
              <button
                type="button"
                style={COPY_BTN}
                onClick={handleCopyLogs}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "#94A3B8";
                }}
              >
                {copied ? "Copied!" : "Copy Logs"}
              </button>
              <pre style={TERMINAL_TEXT}>{errorText}</pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
