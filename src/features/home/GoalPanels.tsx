"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AthleteSilhouette } from "@/components/illustrations/AthleteSilhouette";
import { goalHref } from "@/demo/engine/catalog";
import { goalProduct, rackFacts } from "@/demo/engine/rack";
import { formatARS } from "@/lib/money";
import { useDemoVersion } from "@/stores/admin";
import { useGoals } from "../catalog/useGoals";
import { HomeBlockTitle } from "./HomeBlockTitle";

/**
 * "Entrená por objetivo": un panel alto por objetivo con su silueta de atleta (sin cara), contra la luz del box, y el
 * producto que el dueño eligió para ese objetivo (panel → Categorías → Objetivos) con su precio por servicio.
 */
export function GoalPanels({ n }: { n: number }) {
  useDemoVersion();
  const goals = useGoals().flatMap((g) => { const p = goalProduct(g.id, g.productSlug); return p ? [{ g, p, pps: rackFacts(p).perServing }] : []; });
  return (
    <section aria-labelledby="objetivos-title">
      <HomeBlockTitle id="objetivos-title" n={n} kicker="Por objetivo" title="Entrená por objetivo" />
      <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0">
        {goals.map(({ g, p, pps }) => (
          <li key={g.id} className="w-[42%] shrink-0 snap-start sm:w-[28%] lg:w-auto">
            <Link href={goalHref(g.id)} style={{ "--hue": g.hue } as CSSProperties}
              className="group relative flex h-full min-h-[21rem] flex-col overflow-hidden bg-night text-on-night shadow-[inset_0_2px_0_var(--hue)] transition-shadow hover:shadow-[inset_0_2px_0_var(--hue),0_0_0_1px_var(--hue)]">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_70%_at_50%_10%,color-mix(in_srgb,var(--hue)_28%,transparent),transparent_70%)]" />
              <AthleteSilhouette goal={g.id} className="relative mx-auto mt-4 h-36 w-auto text-(--hue) opacity-90 transition-transform duration-300 group-hover:-translate-y-1" />
              <span className="relative mt-auto flex flex-col gap-1 p-3">
                <span className="font-display text-xl leading-none">{g.name}</span>
                <span className="text-[12px] leading-snug text-night-muted">{g.pitch}</span>
              </span>
              <span className="relative border-t border-white/10 px-3 py-2 font-mono text-[10.5px] leading-tight">
                <span className="block text-(--hue)">Su producto</span>
                <span className="block truncate font-bold text-on-night">{p.name}</span>
                {pps && <span className="block text-night-muted">{formatARS(pps)} / serv</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
