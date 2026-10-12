"use client";
import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { defaultStack, stackSummary } from "@/demo/engine/stack-builder";
import { useGoal } from "../catalog/useGoals";
import type { Goal } from "@/demo/types";
import { splitAccent } from "@/lib/accent";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { GoalChips } from "./GoalChips";
import { StackShelf, shelfItems } from "./shelf/StackShelf";

/** El stack que abre el bloque: proteína, creatina y pre, el clásico. */
const FIRST_GOAL: Goal = "fuerza";

/**
 * Bloque en vivo del inicio (el equivalente al probador de Velmar): chips de objetivo y un estante con el stack
 * sugerido de ese objetivo, el total con el descuento stack y "Armalo a tu medida". Los envases caen recién cuando el
 * bloque entra en pantalla.
 */
export function HomeStackBlock() {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  // Título y texto editables desde el panel (Contenido → Textos de inicio); lo que sigue a la coma va en voltio.
  const cta = useDemoData((d) => d.content.homeCta);
  const [lead, accent] = splitAccent(cta.title);
  const [goal, setGoal] = useState<Goal>(FIRST_GOAL);
  const goalName = useGoal(goal)?.name;
  const shelfRef = useRef<HTMLDivElement>(null);
  const inView = useInView(shelfRef, { once: true, amount: 0.35 });
  const summary = stackSummary(defaultStack(goal, catalog), catalog, rule);
  const discount = summary.stack.discount > 0;
  // Los envases (y el sello del descuento) llegan al estante cuando el bloque se ve.
  const shelf = inView ? shelfItems(summary.lines) : [];
  return (
    <section aria-labelledby="home-stack-title" className="relative overflow-hidden rounded-[2rem] bg-night px-5 py-8 text-on-night sm:rounded-[2.5rem] sm:px-10 sm:py-12 lg:px-12">
      <div aria-hidden="true" className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand-glow)_30%,transparent),transparent)]" />
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <p className="eyebrow text-volt">Armá tu stack · en vivo</p>
            <h2 id="home-stack-title" className="font-display mt-2 text-3xl leading-tight sm:text-5xl">{lead}{accent && <span className="text-volt">{accent}</span>}</h2>
            <p className="mt-3 max-w-md text-night-muted">
              {cta.text}{rule.pct > 0 && ` Con ${rule.minCategories} categorías distintas tenés ${rule.pct} % off.`}
            </p>
          </div>
          <GoalChips tone="night" value={goal} onChange={setGoal} legend="Probá con un objetivo" />
        </div>
        <div ref={shelfRef} className="flex min-w-0 flex-col gap-5">
          <StackShelf items={shelf} discountPct={discount && inView ? summary.stack.pct : 0} title={goalName} />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div aria-live="polite">
              <p className="eyebrow text-[10px] text-night-muted">{discount ? "Total con descuento stack" : "Total"}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-3xl tabular-nums" data-home-stack-total>{formatARS(summary.total)}</span>
                {discount && <s className="font-lab text-sm text-night-muted">{formatARS(summary.subtotal)}</s>}
              </p>
              {summary.perDay !== null && <p className="font-lab mt-1 text-xs text-volt">{formatARS(summary.perDay)} por día · orientativo</p>}
            </div>
            <ButtonLink href={`/crear/?objetivo=${goal}`} variant="light" size="lg" className="max-sm:w-full">
              Armalo a tu medida <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
