"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Anillo de progreso animado (misiones). El texto del centro lleva el valor: nunca solo color. */
export function ProgressRing({ pct, size = 72, stroke = 7, children, label, tone = "primary" }: { pct: number; size?: number; stroke?: number; children?: ReactNode; label: string; tone?: "primary" | "brass" | "success" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = tone === "brass" ? "var(--color-brass)" : tone === "success" ? "var(--color-success)" : "var(--color-primary)";
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - Math.min(100, pct) / 100) }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-center">{children}</span>
    </div>
  );
}
