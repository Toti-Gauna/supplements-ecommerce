import { MomentGlyph } from "@/components/illustrations/BadgeGlyph";
import type { Usage, UsageMoment } from "@/demo/types";
import { cn } from "@/lib/cn";

const MOMENTS: { id: UsageMoment; label: string }[] = [
  { id: "manana", label: "Mañana" },
  { id: "comida", label: "Comidas" },
  { id: "pre", label: "Pre" },
  { id: "intra", label: "Durante" },
  { id: "post", label: "Post" },
  { id: "noche", label: "Noche" },
];

/** "Cómo tomarlo": el día en seis momentos, con los que corresponden encendidos, la dosis y cómo se prepara. */
export function UsageTimeline({ usage }: { usage: Usage }) {
  return (
    <section aria-labelledby="usage-title" className="rounded-[var(--radius-card)] bg-night p-5 text-on-night ring-1 ring-white/[0.06] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow text-volt">Cómo tomarlo</p>
          <h2 id="usage-title" className="font-display mt-1 text-2xl">Tu día con este suplemento</h2>
        </div>
        {usage.dose && <p className="font-lab rounded-full bg-volt px-3 py-1 text-xs font-bold text-night">{usage.dose}</p>}
      </div>
      <ol className="relative mt-6 grid grid-cols-6 gap-1">
        <span aria-hidden="true" className="absolute inset-x-[8%] top-5 h-px bg-white/15" />
        {MOMENTS.map((m) => {
          const on = usage.moments.includes(m.id);
          return (
            <li key={m.id} className="relative flex flex-col items-center gap-2 text-center">
              <span className={cn("grid h-10 w-10 place-items-center rounded-full ring-1 transition-colors", on ? "bg-volt text-night ring-volt shadow-[0_0_18px_rgb(200_255_46/0.55)]" : "bg-night-2 text-night-muted ring-white/10")}>
                <MomentGlyph moment={m.id} className="h-[18px] w-[18px]" />
              </span>
              <span className={cn("text-[11px] font-bold leading-tight", on ? "text-on-night" : "text-night-muted")}>{m.label}</span>
              {on && <span className="sr-only">(recomendado)</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-sm leading-relaxed text-night-muted">{usage.text}</p>
    </section>
  );
}
