import { ShieldCheck, Undo2, Zap } from "lucide-react";
import { DISPATCH_PROMISE } from "@/demo/engine/lead-time";
import type { Product } from "@/demo/types";

/**
 * Lo que da confianza en el equipamiento (no tiene lote ni vencimiento): la garantía de la marca, el cambio de talle
 * (o el cambio, si no tiene talle) y el cadete. Misma etiqueta que la del lote de los suplementos.
 */
export function GearLabel({ product }: { product: Product }) {
  const sized = product.variants.some((v) => v.size);
  const rows = [
    { icon: ShieldCheck, t: "Original, con garantía de la marca" },
    { icon: Undo2, t: sized ? "Cambio de talle sin costo" : "Cambio dentro de los 10 días" },
    { icon: Zap, t: `Cadete en Mar del Plata ${DISPATCH_PROMISE}` },
  ];
  return (
    <div className="flex overflow-hidden rounded-sm border border-ink/70 bg-surface font-lab text-ink">
      <span aria-hidden="true" className="grid rotate-180 place-items-center bg-ink px-2 text-[11px] font-bold tracking-[0.14em] text-bg [writing-mode:vertical-rl]">MARCA</span>
      <ul aria-label="Garantía y cambios" className="grid min-w-0 flex-1 divide-y divide-ink/25 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {rows.map(({ icon: Icon, t }) => (
          <li key={t} className="flex items-center gap-2 px-3 py-2 text-[12px] font-bold leading-tight">
            <Icon size={15} aria-hidden="true" className="shrink-0 text-success" />{t}
          </li>
        ))}
      </ul>
    </div>
  );
}
