"use client";
import { Layers } from "lucide-react";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { getCategory } from "@/demo/engine/catalog";
import { DEFAULT_STACK_RULE, type StackResult } from "@/demo/engine/stack";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";

/**
 * Estado del descuento stack en el carrito: cuántas categorías de suplementos hay (una celda por categoría) y cuánto
 * falta. Solo aparece si hay al menos un suplemento: con accesorios solos no tiene sentido.
 */
export function StackNudge({ stack, compact = false }: { stack: StackResult; compact?: boolean }) {
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  if (stack.categories.length === 0 || rule.pct <= 0) return null;
  const names = stack.categories.map((c) => getCategory(c)?.name ?? c).join(" + ");
  const done = stack.missing === 0;
  return (
    <div className="rounded-sm bg-night px-4 py-3 text-on-night ring-1 ring-volt/20">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Layers size={18} aria-hidden="true" className="shrink-0 text-volt" />
        {done
          ? <span>¡Armaste tu stack! <strong className="text-volt">{rule.pct} % off: {formatARS(stack.discount)}</strong></span>
          : <span>Sumá <strong className="text-volt">{stack.missing} categoría{stack.missing === 1 ? "" : "s"}</strong> más de suplementos y tenés {rule.pct} % off en el stack</span>}
      </p>
      <BatteryMeter pct={(stack.categories.length / rule.minCategories) * 100} cells={rule.minCategories} label={`${stack.categories.length} de ${rule.minCategories} categorías para el descuento stack`} className="mt-2 border-white/15" tone={done ? "success" : "volt"} />
      {!compact && <p className="mt-2 text-xs text-night-muted">En tu carrito: {names}.</p>}
    </div>
  );
}
