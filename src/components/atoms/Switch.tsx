"use client";
import { cn } from "@/lib/cn";

export function Switch({ checked, onChange, label, description, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; ariaLabel?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={ariaLabel} onClick={() => onChange(!checked)} className="flex min-h-11 items-center gap-3 text-left">
      <span aria-hidden="true" className={cn("relative h-7 w-12 shrink-0 rounded-xs border transition-colors duration-150", checked ? "border-transparent bg-primary" : "border-line bg-accent")}>
        <span className={cn("absolute top-[3px] h-5 w-5 rounded-xs bevel transition-transform duration-150", checked ? "translate-x-[22px] bg-on-primary" : "translate-x-[3px] bg-muted")} />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
    </button>
  );
}
