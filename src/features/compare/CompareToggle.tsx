"use client";
import { Check } from "lucide-react";
import { COMPARE_MAX, compareHref } from "@/demo/engine/compare";
import { cn } from "@/lib/cn";
import { useCompare } from "@/stores/compare";
import { useToasts } from "@/stores/toast";
import { useCompareTray } from "./useCompareTray";

/**
 * "Comparar" de la tarjeta: suma o saca el producto de la bandeja (hasta 3). Con 3, el cuarto no entra y un aviso
 * lleva a comparar los que ya están. Es un botón de dos estados (`aria-pressed`), chico y sobre el estante.
 */
export function CompareToggle({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const { slugs, ready } = useCompareTray();
  const toggle = useCompare((s) => s.toggle);
  const push = useToasts((s) => s.push);
  const on = ready && slugs.includes(slug);
  const onClick = () => {
    if (toggle(slug) !== "full") return;
    push({ tone: "info", title: `Ya tenés ${COMPARE_MAX} para comparar`, description: "Sacá uno de la bandeja para sumar otro.", action: { label: "Comparar", href: compareHref(slugs) } });
  };
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={`Comparar ${name}`}
      className={cn(
        "pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-xs border px-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] backdrop-blur-sm transition-colors",
        on ? "border-primary bg-primary text-on-primary" : "border-line bg-surface/90 text-ink hover:border-ink/50",
        className,
      )}>
      <span aria-hidden="true" className={cn("grid size-3.5 place-items-center border", on ? "border-on-primary" : "border-ink/50")}>
        {on && <Check size={11} strokeWidth={3.5} />}
      </span>
      Comparar
    </button>
  );
}
