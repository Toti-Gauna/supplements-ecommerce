"use client";
import { scrollBehavior } from "@/lib/scroll";
import { Camera, Sparkles } from "lucide-react";
import { CollarPreview } from "@/components/illustrations/CollarPreview";
import { collarPresets, type CollarPreset } from "@/demo/fixtures/collar";
import { FONT_FAMILIES } from "@/demo/fixtures/templates";
import { describeCollar } from "@/demo/engine/collar";
import type { CollarSpec } from "@/demo/fixtures/collar";
import { useToasts } from "@/stores/toast";

/** Combinaciones listas (como las del Instagram del taller) que cargan el configurador con un toque. */
export function CollarInspiration({ spec, onPick }: { spec: CollarSpec; onPick: (p: CollarPreset) => void }) {
  const push = useToasts((s) => s.push);
  return (
    <section aria-labelledby="collar-ideas" className="rounded-[1.75rem] bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-brass-ink"><Camera size={13} aria-hidden="true" /> Ideas para inspirarte</p>
          <h2 id="collar-ideas" className="font-display mt-1 text-2xl">Combinaciones listas</h2>
        </div>
        <p className="hidden text-right text-xs text-muted sm:block">Tocá una y la cambiás a tu gusto</p>
      </div>
      <ul className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pb-1">
        {collarPresets.map((p) => (
          <li key={p.id} className="w-[11.5rem] shrink-0 snap-start">
            <button type="button" aria-label={`Usar la combinación ${p.title}: ${p.name}, ${describeCollar(spec, p.config)}`}
              onClick={() => { onPick(p); push({ tone: "success", title: `Cargamos “${p.title}”`, description: "Cambiá el nombre o lo que quieras: la vista previa se actualiza en vivo." }); document.getElementById("personalizar")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" }); }}
              className="group flex w-full flex-col overflow-hidden rounded-3xl bg-bg text-left ring-1 ring-ink/[0.06] transition-shadow hover:shadow-[var(--shadow-card)] hover:ring-primary">
              <CollarPreview compact text={p.name} font={FONT_FAMILIES[p.font] ?? FONT_FAMILIES.Redondeada!} letterColor={p.letterColor} config={p.config} className="aspect-square w-full bg-[radial-gradient(120%_90%_at_50%_0%,#fffaf1,#efe6d4)]" label="" />
              <span className="flex flex-col gap-0.5 p-3">
                <span className="text-sm font-extrabold">{p.title}</span>
                <span className="line-clamp-2 text-xs text-muted">{describeCollar(spec, p.config)}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline"><Sparkles size={12} aria-hidden="true" /> Quiero este</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
