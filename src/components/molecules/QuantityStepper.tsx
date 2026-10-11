"use client";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, min = 1, max, onChange, label, size = "md" }: QuantityStepperProps) {
  // El número rueda hacia arriba al sumar y hacia abajo al restar.
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);
  if (value !== prev) { setDir(value > prev ? 1 : -1); setPrev(value); }
  const btn = `grid ${size === "sm" ? "h-9 w-9" : "h-10 w-10"} place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:opacity-30`;
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-ink/15 bg-surface p-0.5">
      <button type="button" aria-label="Restar uno" disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}><Minus size={16} aria-hidden="true" /></button>
      <span className={`relative grid h-6 overflow-hidden ${size === "sm" ? "w-6" : "w-8"} text-center text-[15px] font-extrabold tabular-nums`}>
        <output aria-live="polite" className="sr-only">{value}</output>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={value} aria-hidden="true" className="col-start-1 row-start-1 leading-6" initial={{ y: `${dir * 100}%`, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: `${-dir * 100}%`, opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>{value}</motion.span>
        </AnimatePresence>
      </span>
      <button type="button" aria-label="Sumar uno" disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}
