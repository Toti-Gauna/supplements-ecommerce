import type { CSSProperties } from "react";

const COLORS = ["#3d4a2a", "#c9a77a", "#e88aa0", "#8cbfe0", "#e3a948"];
const PIECES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return { dx: Math.cos(angle) * (60 + (i % 3) * 18), dy: Math.sin(angle) * (40 + (i % 4) * 12) - 20, rot: i * 47, color: COLORS[i % COLORS.length]! };
});

/** Ráfaga corta de confeti (900 ms, una vez). Oculta con prefers-reduced-motion. */
export function Celebration() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-8 top-6">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute h-2 w-1.5 rounded-sm"
          style={{ background: p.color, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, animationDelay: `${(i % 4) * 30}ms` } as CSSProperties}
        />
      ))}
    </span>
  );
}
