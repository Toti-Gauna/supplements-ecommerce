"use client";
import { useEffect, useRef, useState } from "react";
import { Led } from "@/components/atoms/Led";
import { shopNow } from "@/demo/clock";
import { countdownParts } from "@/demo/engine/campaign-window";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import s from "./campaign.module.css";

interface CountdownProps {
  /** Hasta cuándo cuenta (ms) y el desfase del reloj de la campaña (vista previa). */
  target: number;
  offset: number;
  /** "Termina en", "Abre en". */
  label: string;
  /** Llegó a cero: la campaña cambió de momento. */
  onDone?: () => void;
  className?: string;
  ledClassName?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Cuenta regresiva de marcador: días, horas, minutos y segundos en dígitos LED. Es lo único que se redibuja cada
 * segundo (no la escena), y con la pestaña oculta no corre. La lectura para lectores de pantalla va sin segundos
 * (role="timer" no se anuncia solo).
 */
export function Countdown({ target, offset, label, onDone, className, ledClassName = "h-5! sm:h-7!" }: CountdownProps) {
  const [now, setNow] = useState(() => shopNow() + offset);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; }, [onDone]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const t = shopNow() + offset;
      setNow(t);
      if (t >= target) { window.clearInterval(id); done.current?.(); }
    }, 1000);
    return () => window.clearInterval(id);
  }, [target, offset]);
  const p = countdownParts(target, now);
  const read = `${label} ${plural(p.days, "día", "días")}, ${plural(p.hours, "hora", "horas")} y ${plural(p.minutes, "minuto", "minutos")}`;
  const cells: [string, string][] = [[pad(p.days), "d"], [pad(p.hours), "h"], [pad(p.minutes), "m"], [pad(p.seconds), "s"]];
  return (
    <div role="timer" aria-label={read} data-countdown={target} className={cn("min-w-0", className)}>
      <p aria-hidden="true" className={cn(s.mono, "text-[10px] font-bold uppercase tracking-[0.18em] text-night-muted")}>{label}</p>
      <p aria-hidden="true" className="mt-1.5 flex items-end gap-1.5 sm:gap-2">
        {cells.map(([value, unit]) => (
          <span key={unit} className="flex items-end gap-0.5">
            <Led value={value} label="" tone="chalk" motion="none" className={ledClassName} />
            <span className={cn(s.mono, "pb-px text-[10px] font-bold uppercase text-night-muted")}>{unit}</span>
          </span>
        ))}
      </p>
    </div>
  );
}
