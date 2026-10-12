"use client";
import { RotateCcw, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import type { StackRule } from "@/demo/engine/stack";
import type { StackSummary } from "@/demo/engine/stack-builder";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

interface Props {
  summary: StackSummary;
  rule: StackRule;
  /** `/crear/?objetivo=…&stack=…`: el armador abre con este estante. */
  builderHref: string;
  onRestart: () => void;
}

/**
 * Resumen del stack recomendado con la MISMA regla que el carrito (`stackSummary`): subtotal, descuento stack, total
 * y costo por día. Agrega cada variante al carrito y lo abre, o lleva al armador para ajustarlo.
 */
export function QuizTotals({ summary, rule, builderHref, onRestart }: Props) {
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const { stack, lines } = summary;
  const on = rule.pct > 0;
  const addStackToCart = () => {
    lines.forEach((l) => add({ productSlug: l.product.slug, variantId: l.variant.id, quantity: 1 }));
    openCart(lines[0]?.product.slug);
  };
  return (
    <aside aria-labelledby="quiz-total-title" className="relative overflow-hidden rounded-[var(--radius-card)] bg-night p-5 text-on-night sm:p-6 lg:sticky lg:top-24">
      <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand-volt)_16%,transparent),transparent)]" />
      <p className="eyebrow relative text-volt">Tu stack · {lines.length} producto{lines.length === 1 ? "" : "s"}</p>
      <h2 id="quiz-total-title" className="font-display relative mt-1 text-2xl">{stack.discount > 0 ? "Con el descuento stack" : "Resumen"}</h2>
      {on && (
        <BatteryMeter pct={(stack.categories.length / rule.minCategories) * 100} cells={rule.minCategories} tone={stack.missing === 0 ? "success" : "volt"}
          label={`${Math.min(stack.categories.length, rule.minCategories)} de ${rule.minCategories} categorías para el descuento stack`} className="relative mt-4 border-white/15" />
      )}
      <dl aria-label="Totales del stack" className="relative mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-night-muted">Subtotal</dt><dd className="font-lab tabular-nums">{formatARS(summary.subtotal)}</dd></div>
        {stack.discount > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-volt"><dt>Descuento stack ({stack.pct} %)</dt><dd className="font-lab tabular-nums">−{formatARS(stack.discount)}</dd></div>
        )}
        <div className="mt-1 flex items-end justify-between gap-3 border-t border-white/10 pt-3"><dt className="font-bold">Total</dt><dd className="font-display text-3xl tabular-nums">{formatARS(summary.total)}</dd></div>
        {summary.perDay !== null && (
          <div className="flex justify-between gap-3 text-xs text-night-muted"><dt>Por día (un servicio de cada uno)</dt><dd className="font-lab tabular-nums text-on-night">≈ {formatARS(summary.perDay)}</dd></div>
        )}
      </dl>
      {on && stack.missing > 0 && (
        <p className="relative mt-3 text-xs text-night-muted">Sumá {stack.missing} categoría{stack.missing === 1 ? "" : "s"} más en el armador para el {rule.pct} % off.</p>
      )}
      <div className="relative mt-5 flex flex-col gap-2.5">
        <Button variant="light" size="lg" onClick={addStackToCart} disabled={lines.length === 0} className="w-full px-5"><ShoppingBag size={18} aria-hidden="true" />Agregar el stack al carrito</Button>
        <ButtonLink href={builderHref} variant="dark" className="w-full"><SlidersHorizontal size={17} aria-hidden="true" />Ajustarlo en el armador</ButtonLink>
        <button type="button" onClick={onRestart} className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-night-muted underline-offset-4 hover:text-on-night hover:underline">
          <RotateCcw size={15} aria-hidden="true" />Hacer el quiz de nuevo
        </button>
      </div>
      {on && <p className="relative mt-3 text-xs text-night-muted">El carrito aplica la misma regla: {rule.pct} % desde {rule.minCategories} categorías distintas de suplementos.</p>}
    </aside>
  );
}
