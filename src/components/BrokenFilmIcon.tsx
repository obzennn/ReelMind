import React from "react";

export const KEYFRAMES = `
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

export function BrokenFilmIcon() {
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
      <rect x="8" y="6" width="40" height="44" rx="4" stroke="url(#iconGrad)" strokeWidth="2.5" fill="none" />
      <rect x="12" y="12" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="12" y="22" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="12" y="32" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="12" y="42" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="12" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="22" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="32" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <rect x="39" y="42" width="5" height="4" rx="1" fill="url(#iconGrad)" />
      <line x1="18" y1="18" x2="38" y2="38" stroke="url(#iconGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
      <line x1="22" y1="14" x2="36" y2="42" stroke="url(#iconGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" strokeDasharray="2 4" />
    </svg>
  );
}
