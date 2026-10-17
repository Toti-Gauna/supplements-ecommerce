"use client";
import { useState } from "react";
import { SegmentedTabs, panelId, tabId } from "@/components/molecules/SegmentedTabs";
import { AthleteSilhouette } from "@/components/illustrations/AthleteSilhouette";
import { SportArt } from "@/components/illustrations/SportArt";
import { productHref } from "@/demo/engine/catalog";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { goalCards, sportCards } from "@/demo/engine/stack-goals";
import type { StackSummary } from "@/demo/engine/stack-builder";
import { useSports } from "../catalog/useSports";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useDemoData, useDemoVersion } from "@/stores/admin";
import { useGoals } from "../catalog/useGoals";
import { HomeBlockTitle } from "./HomeBlockTitle";
import { TrainCard } from "./TrainCard";

type Tab = "objetivos" | "deportes";
const ID = "entrena";

/** Riel en el celular (se desliza de costado, sin desbordar la página) y grilla en pantallas anchas. */
const RAIL = "no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:overflow-visible lg:px-0";
const ITEM = "w-[44%] max-w-[13rem] shrink-0 snap-start sm:w-[28%] lg:w-auto lg:max-w-none";

/** Lo mismo en las dos pestañas: el total del stack grande y, chico, cuántos productos lleva y cuánto sale por día. */
function stackLines({ lines, stack, perDay }: StackSummary) {
  return [
    <span key="n" className="font-bold text-on-night">{lines.length} productos{stack.discount > 0 ? ` · −${stack.pct} %` : ""}</span>,
    perDay !== null ? `${formatARS(perDay)} por día` : "Armalo a tu medida",
  ];
}

function GoalCards() {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  return (
    <ul className={cn(RAIL, "lg:grid-cols-7")}>
      {goalCards(useGoals(), catalog, rule).map((g) => (
        <li key={g.id} className={ITEM}>
          <TrainCard hue={g.hue} name={g.name} pitch={g.pitch} art={<AthleteSilhouette goal={g.id} />} href={g.href}
            priceLabel="Su stack" price={g.summary.total} lines={stackLines(g.summary)}
            extra={g.featured ? { href: productHref(g.featured.slug), label: `Ver ${g.featured.name}` } : undefined} reserveExtra />
        </li>
      ))}
    </ul>
  );
}

function SportCards() {
  const catalog = useDemoData((d) => d.products);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const packs = useDemoData((d) => d.packs) ?? [];
  return (
    <ul className={cn(RAIL, "lg:grid-cols-6")}>
      {sportCards(catalog, rule).map((s) => {
        const pack = s.packId ? packs.find((p) => p.id === s.packId && p.active !== false) : undefined;
        return (
          <li key={s.id} className={ITEM}>
            <TrainCard hue={s.hue} name={s.name} pitch={s.pitch} art={<SportArt sport={s.id} />} href={s.href}
              priceLabel="Su stack" price={s.summary.total} lines={stackLines(s.summary)}
              extra={pack ? { href: `/packs/?pack=${encodeURIComponent(pack.id)}`, label: `Ver ${pack.name}` } : undefined} reserveExtra />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * "Entrená por objetivo o por deporte": dos pestañas. Objetivos: un panel por objetivo con su silueta de atleta, el
 * total de su stack y el producto que el dueño destacó (panel → Categorías → Objetivos). Deportes: un panel por deporte con su dibujo, el total
 * del stack sugerido y, si hay, su pack. Cada panel abre el armador con esa combinación.
 */
export function GoalPanels({ n }: { n: number }) {
  useDemoVersion();
  const [tab, setTab] = useState<Tab>("objetivos");
  const goalsCount = useGoals().length;
  const sportsCount = useSports().length;
  return (
    <section aria-labelledby="objetivos-title">
      <HomeBlockTitle id="objetivos-title" n={n} kicker="¿Para qué lo querés?" title="Entrená por objetivo o por deporte" />
      <SegmentedTabs idBase={ID} label="Entrená por" value={tab} onChange={setTab} className="mb-4 w-full sm:w-auto"
        tabs={[{ id: "objetivos", label: "Objetivos", count: goalsCount }, { id: "deportes", label: "Deportes", count: sportsCount }]} />
      {/* Los dos paneles quedan en el DOM (cada pestaña apunta al suyo); el inactivo va oculto. */}
      <div role="tabpanel" id={panelId(ID, "objetivos")} aria-labelledby={tabId(ID, "objetivos")} hidden={tab !== "objetivos"}><GoalCards /></div>
      <div role="tabpanel" id={panelId(ID, "deportes")} aria-labelledby={tabId(ID, "deportes")} hidden={tab !== "deportes"}><SportCards /></div>
    </section>
  );
}
