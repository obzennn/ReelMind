import React, { useState } from "react";
import { BrokenFilmIcon } from "./BrokenFilmIcon";

const GRADIENT_BG: React.CSSProperties = {
  background: "linear-gradient(to bottom right, #0F172A, #020617)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily: "'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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

export function GlobalErrorUI({ errorText }: { errorText: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.href;
  };

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <body style={GRADIENT_BG}>
      <div style={GLASS_CARD}>
        <BrokenFilmIcon />
        <h1 style={HEADING}>Something Went Wrong</h1>
        <p style={SUBTEXT}>
          The app ran into a build error. This is usually caused by a stale cache and is easy to fix.
        </p>

        <button
          type="button"
          style={BTN_PRIMARY}
          onClick={handleRefresh}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 10px 20px -5px rgba(255, 51, 102, 0.4)";
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
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
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
  );
}
