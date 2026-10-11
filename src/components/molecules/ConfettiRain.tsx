"use client";
import { createPortal } from "react-dom";
import { useEffect, useState, type CSSProperties } from "react";

const COLORS = ["#d2ad69", "#f3dca6", "#3a4527", "#e88aa0", "#8cbfe0", "#fffdf8", "#b4573a"];
// Posiciones y tiempos fijos (sin Math.random): el render es estable y no hay diferencias de hidratación.
const PIECES = Array.from({ length: 72 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 12) * 70 + Math.floor(i / 12) * 40,
  duration: 1900 + ((i * 53) % 1100),
  drift: ((i * 29) % 160) - 80,
  spin: 360 + ((i * 47) % 540),
  w: 6 + (i % 3) * 2,
  h: i % 4 === 0 ? 6 : 12 + (i % 2) * 4,
  round: i % 4 === 0,
  color: COLORS[i % COLORS.length]!,
}));

/** Lluvia de confeti a pantalla completa (≈3 s, una vez). Oculta con "reducir movimiento". */
export function ConfettiRain() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 3400);
    return () => window.clearTimeout(t);
  }, []);
  if (!show || typeof document === "undefined") return null;
  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {PIECES.map((p, i) => (
        <span key={i} className="confetti-fall absolute -top-6 block"
          style={{ left: `${p.left}%`, width: p.w, height: p.h, background: p.color, borderRadius: p.round ? 9999 : 2,
            "--drift": `${p.drift}px`, "--spin": `${p.spin}deg`, animationDelay: `${p.delay}ms`, animationDuration: `${p.duration}ms` } as CSSProperties} />
      ))}
    </div>,
    document.body,
  );
}
