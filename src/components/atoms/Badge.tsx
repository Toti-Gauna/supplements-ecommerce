import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "brand" | "demo";
const tones: Record<Tone, string> = {
  neutral: "border-line bg-accent text-ink",
  success: "border-success/40 bg-success-soft text-success",
  warning: "border-warning/40 bg-warning-soft text-warning",
  danger: "border-danger/40 bg-danger-soft text-danger",
  brand: "border-transparent bg-primary text-on-primary",
  demo: "border-dashed border-warning bg-warning-soft text-warning",
};

/** Placa chica: recta, filo fino y rótulo en mono mayúscula (estado, sello, aviso). */

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em]", tones[tone], className)}>{children}</span>;
}
