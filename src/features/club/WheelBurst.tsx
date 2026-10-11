import type { CSSProperties } from "react";
import { ION, PLATES, VOLT } from "./wheel-art";

const COLORS = [...PLATES.map((p) => p.base), VOLT, ION, "#eef1f5"];

/** Trozos de goma de colores y nubes de tiza que salen en abanico (posiciones fijas, sin azar en el render). */
const PIECES = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2 + (i % 2) * 0.1;
  const reach = 110 + (i % 5) * 34;
  const chalk = i % 6 === 5;
  return {
    dx: Math.round(Math.cos(angle) * reach), dy: Math.round(Math.sin(angle) * reach * 0.8 - 30), rot: (i * 67) % 540,
    color: chalk ? "rgb(238 241 245 / 0.55)" : COLORS[i % COLORS.length]!, w: chalk ? 16 : 6 + (i % 3) * 3, h: chalk ? 16 : 10 + (i % 2) * 6, round: chalk || i % 4 === 0,
  };
});

/** Festejo del premio: ráfaga corta (1 s, una vez) desde el centro del cupón. Oculta con "reducir movimiento". */
export function WheelBurst() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] z-10">
      {PIECES.map((p, i) => (
        <span key={i} className="confetti-piece absolute"
          style={{ width: p.w, height: p.h, background: p.color, borderRadius: p.round ? 9999 : 2, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, animationDelay: `${(i % 5) * 35}ms` } as CSSProperties} />
      ))}
    </span>
  );
}
