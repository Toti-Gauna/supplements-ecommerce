"use client";
import { Layers } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { stackRuleExample } from "@/demo/admin/stack-rule";
import { firstInStock } from "@/demo/engine/stack-builder";
import { getCategory } from "@/demo/engine/catalog";
import { STACK_CATEGORIES, type StackRule } from "@/demo/engine/stack";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";

/**
 * Vista previa de la regla en edición con un ejemplo real del catálogo: los más vendidos de cada categoría hasta
 * llegar al mínimo, con lo que se ahorra. Usa el mismo cálculo que el carrito (`stackDiscount`).
 */
export function StackRulePreview({ rule, valid }: { rule: StackRule; valid: boolean }) {
  const catalog = useDemoData((d) => d.products);
  const ex = stackRuleExample(rule, catalog);
  const names = ex.products.map((p) => p.name).join(" + ");
  const counted = new Intl.ListFormat("es", { type: "conjunction" }).format(STACK_CATEGORIES.map((c) => getCategory(c)?.name.toLowerCase() ?? c));
  return (
    <section aria-labelledby="stack-preview-title" aria-live="polite" className="relative overflow-hidden rounded-3xl bg-night p-5 text-on-night sm:p-6">
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgb(139_114_255/0.35),transparent)]" />
      <p id="stack-preview-title" className="eyebrow relative flex items-center gap-2 text-volt"><Layers size={14} aria-hidden="true" />Vista previa</p>
      {!valid ? (
        <p className="relative mt-3 text-sm text-night-muted">Corregí los valores para ver el ejemplo.</p>
      ) : rule.pct === 0 ? (
        <p className="relative mt-3 font-display text-2xl leading-tight">Descuento stack apagado</p>
      ) : (
        <p className="relative mt-3 font-display text-2xl leading-tight">Sumá {rule.minCategories} categorías y llevate <span className="text-volt">{rule.pct} % off</span></p>
      )}
      {valid && ex.products.length > 0 && (
        <ul aria-label="Productos del ejemplo" className="relative mt-4 flex flex-wrap gap-2">
          {ex.products.map((p) => (
            <li key={p.slug} className="w-[5.5rem] rounded-2xl bg-white/[0.05] p-1.5 ring-1 ring-white/10 sm:w-[6.5rem]">
              <ProductArt art={p.art} pack={p.pack} tint={firstInStock(p)?.colorHex} bare label="" showBadge={false} className="aspect-square rounded-xl" />
              <span className="mt-1 line-clamp-2 block px-1 pb-0.5 text-[11px] font-bold leading-tight">{p.name}</span>
            </li>
          ))}
        </ul>
      )}
      {valid && (
        <>
          <BatteryMeter pct={100} cells={rule.minCategories} tone={rule.pct > 0 && ex.complete ? "success" : "volt"} label={`${rule.minCategories} categorías distintas para el descuento`} className="relative mt-4 border-white/15" />
          <p className="relative mt-4 text-sm">
            {!ex.complete
              ? `Con el catálogo activo no hay suplementos de ${rule.minCategories} categorías distintas: nadie llega al descuento.`
              : rule.pct === 0
                ? "Con 0 % no se descuenta nada: la ficha deja de ofrecerlo y el carrito no muestra el aviso."
                : <>Con {names} ahorrás <strong className="font-lab whitespace-nowrap text-volt">{formatARS(ex.discount)}</strong>.</>}
          </p>
          {ex.complete && rule.pct > 0 && (
            <dl className="font-lab relative mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/[0.05] p-2"><dt className="text-night-muted">Subtotal</dt><dd className="mt-0.5 text-sm font-bold">{formatARS(ex.subtotal)}</dd></div>
              <div className="rounded-xl bg-white/[0.05] p-2"><dt className="text-night-muted">Stack {rule.pct} %</dt><dd className="mt-0.5 text-sm font-bold text-volt">−{formatARS(ex.discount)}</dd></div>
              <div className="rounded-xl bg-white/[0.05] p-2"><dt className="text-night-muted">Total</dt><dd className="mt-0.5 text-sm font-bold">{formatARS(ex.total)}</dd></div>
            </dl>
          )}
        </>
      )}
      <p className="relative mt-4 text-xs text-night-muted">Cuentan {counted}; lo demás (snacks, accesorios) no suma.</p>
    </section>
  );
}
