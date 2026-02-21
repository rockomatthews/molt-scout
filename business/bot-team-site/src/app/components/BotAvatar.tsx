import React from "react";

function hashToHue(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function BotAvatar({ seed, size = 72 }: { seed: string; size?: number }) {
  const hue = hashToHue(seed);
  const bg = `hsl(${hue} 70% 12%)`;
  const fg = `hsl(${hue} 80% 60%)`;

  const initials = seed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Avatar ${seed}`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fg} stopOpacity="0.9" />
          <stop offset="1" stopColor={fg} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="18" fill={bg} />
      <circle cx="50" cy="42" r="18" fill={`url(#g-${seed})`} />
      <rect x="24" y="62" width="52" height="20" rx="10" fill={`url(#g-${seed})`} />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontSize="18"
        fontFamily="ui-sans-serif, system-ui, -apple-system"
        fill="white"
        opacity="0.9"
      >
        {initials || seed.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}
