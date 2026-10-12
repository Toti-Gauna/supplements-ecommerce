"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { Reveal } from "@/components/motion/Reveal";
import { goalHref, productsForGoal } from "@/demo/engine/catalog";
import { useGoals } from "../catalog/useGoals";
import { useDemoVersion } from "@/stores/admin";
import { plural } from "@/lib/plural";

/**
 * "¿Cuál es tu objetivo?": una tarjeta oscura por objetivo, con su color, su ícono, el producto más vendido de ese
 * objetivo y cuántos productos hay. En el celular se desliza; en escritorio, grilla de cuatro.
 */
export function GoalRail({ heading = true }: { heading?: boolean }) {
  useDemoVersion();
  const goals = useGoals();
  const items = goals.map((g) => ({ g, list: productsForGoal(g.id) })).filter((x) => x.list.length > 0);
  return (
    <section aria-labelledby="goals-title">
      <Reveal className={heading ? "mb-6" : "sr-only"}>
        <p className="eyebrow text-volt-ink">Por objetivo</p>
        <h2 id="goals-title" className="font-display mt-2 text-3xl sm:text-4xl">¿Cuál es tu objetivo?</h2>
      </Reveal>
      <ul className={heading ? "no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
        {items.map(({ g, list }, i) => {
          const top = list[0]!;
          return (
            <Reveal as="li" key={g.id} y={0} delay={i * 0.05} className={heading ? "w-[72%] shrink-0 snap-start sm:w-auto" : undefined}>
              <Link href={goalHref(g.id)} style={{ "--hue": g.hue } as CSSProperties}
                className="group relative flex h-full min-h-[11.5rem] overflow-hidden rounded-[var(--radius-card)] bg-night p-5 text-on-night ring-1 ring-white/[0.06] transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--hue),0_24px_50px_-24px_var(--hue)]">
                <span aria-hidden="true" className="absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: "var(--hue)" }} />
                <span className="relative z-10 flex min-w-0 flex-1 flex-col">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10" style={{ color: "var(--hue)" }}><GoalGlyph goal={g.id} /></span>
                  <span className="font-display mt-auto pt-6 text-xl leading-tight">{g.name}</span>
                  <span className="mt-1 max-w-[64%] text-[13px] leading-snug text-night-muted">{g.pitch}</span>
                  <span className="mt-3 flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--hue)" }}>
                    {plural(list.length, "producto", "productos")} <ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </span>
                <ProductArt art={top.art} pack={top.pack} tint={top.variants[0]?.colorHex} bare label="" showBadge={false}
                  className="pointer-events-none absolute -bottom-6 -right-8 h-40 w-40 opacity-90 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:scale-105" />
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
