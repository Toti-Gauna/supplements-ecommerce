import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/** Logo de Volta: una "M" de dos picos sobre una "V", con cortes rectos a 45° (como en su Instagram). */
export const LOGO_VIEWBOX = "156 234 558 452";
export const LOGO_M = "M187.5 432.5 323 297l112 112 112-112 135.5 135.5";
export const LOGO_V = "M295.5 487.5 435 627l139.5-139.5";
export const LOGO_STROKE = 78;

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" className={cn("h-8 w-8 text-primary", className)}>
      <path d={`${LOGO_M}M${LOGO_V.slice(1)}`} fill="none" stroke="currentColor" strokeWidth={LOGO_STROKE} strokeLinejoin="miter" />
    </svg>
  );
}

/** `topper`: adorno que se apoya sobre la marca (el sombrero de la temática vigente). */
export function Logo({ className, tone = "dark", topper }: { className?: string; tone?: "dark" | "light"; topper?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative">
        <LogoMark className={tone === "light" ? "text-brass" : undefined} />
        {topper && <span className="animate-pop pointer-events-none absolute -right-2.5 -top-4 h-6 w-6 rotate-[14deg] drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]">{topper}</span>}
      </span>
      <span className={cn("font-display text-[1.6rem] leading-none", tone === "light" ? "text-[#f6f1e8]" : "text-ink")}>{brand.name}</span>
    </span>
  );
}
