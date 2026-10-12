"use client";
import { Gamepad2, Layers, type LucideIcon, Star, TicketPercent } from "lucide-react";
import { STUDIO_TEMPLATES, type StudioTemplate } from "@/demo/fixtures/studio";
import { cn } from "@/lib/cn";

const ICON: Record<StudioTemplate, LucideIcon> = { offer: TicketPercent, product: Star, stack: Layers, game: Gamepad2 };

/** Qué cuenta la pieza: la oferta de la fecha, un producto, el stack del mes o el cupón del juego. */
export function TemplatePicker({ value, onChange }: { value: StudioTemplate; onChange: (t: StudioTemplate) => void }) {
  return (
    <div role="group" aria-label="Plantilla" className="mt-3 grid grid-cols-2 gap-2">
      {STUDIO_TEMPLATES.map((t) => {
        const Icon = ICON[t.id];
        const on = value === t.id;
        return (
          <button key={t.id} type="button" aria-pressed={on} onClick={() => onChange(t.id)} title={t.hint}
            className={cn("flex min-h-20 flex-col items-start gap-1.5 rounded-2xl p-3 text-left text-sm font-bold ring-1 transition-colors", on ? "bg-accent ring-2 ring-primary" : "bg-bg ring-ink/10 hover:bg-accent/60")}>
            <Icon size={18} aria-hidden="true" className={on ? "text-primary" : "text-muted"} />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
