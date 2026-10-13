"use client";
import Link from "next/link";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { ProductGrid } from "@/components/molecules/ProductCard";
import { goalHref, productsForGoal } from "@/demo/engine/catalog";
import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import { useDemoVersion } from "@/stores/admin";
import { toCard } from "./mappers";
import { useGoals } from "./useGoals";

/** Filtro por objetivo (`?objetivo=`): chips arriba y la grilla de ese objetivo, sin necesidad de escribir. */
export function GoalView({ goal }: { goal: Goal }) {
  useDemoVersion();
  const goals = useGoals();
  const info = goals.find((g) => g.id === goal)!;
  const list = productsForGoal(goal);
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Objetivos" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {goals.map((g) => (
          <Link key={g.id} href={goalHref(g.id)} aria-current={g.id === goal ? "page" : undefined}
            className={cn("inline-flex shrink-0 items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold transition-colors", g.id === goal ? "border-primary bg-primary text-on-primary" : "border-line bg-surface hover:border-ink/30")}>
            <GoalGlyph goal={g.id} className="h-4 w-4" /> {g.name}
          </Link>
        ))}
      </nav>
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">{info.name}</h2>
        <p className="mt-1 text-muted">{info.pitch} <span className="font-mono text-xs font-bold uppercase tracking-wider text-volt-ink">{plural(list.length, "producto", "productos")}</span></p>
      </div>
      <ProductGrid products={list.map(toCard)} />
    </div>
  );
}
