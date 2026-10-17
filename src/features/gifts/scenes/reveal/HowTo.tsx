import { MomentGlyph } from "@/components/illustrations/BadgeGlyph";
import type { Usage, UsageMoment } from "@/demo/types";

const MOMENT: Record<UsageMoment, string> = { manana: "Mañana", comida: "Con las comidas", pre: "Antes de entrenar", intra: "Durante", post: "Después de entrenar", noche: "Noche" };

/** "Cómo tomarlo" en la tarjeta de atleta: la dosis como dato de laboratorio, el modo de uso y los momentos del día. */
export function HowTo({ usage }: { usage: Usage }) {
  return (
    <section aria-labelledby="regalo-como-tomarlo" className="rounded-sm border border-white/10 bg-white/[0.04] p-4 text-left">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="regalo-como-tomarlo" className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-night-muted">Cómo tomarlo</h3>
        {usage.dose && <p className="font-mono text-sm font-extrabold uppercase tracking-[0.04em] text-volt-soft">{usage.dose}</p>}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-on-night">{usage.text}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Momentos del día">
        {usage.moments.map((m) => (
          <li key={m} className="inline-flex items-center gap-1 rounded-xs border border-white/15 px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-on-night">
            <MomentGlyph moment={m} className="h-3.5 w-3.5" />{MOMENT[m]}
          </li>
        ))}
      </ul>
    </section>
  );
}
