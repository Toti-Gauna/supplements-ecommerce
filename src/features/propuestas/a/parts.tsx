import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import type { StockState } from "@/demo/admin/stock";
import type { ProductBadge } from "@/demo/types";
import { cn } from "@/lib/cn";
import type { FlavorLight } from "./data";
import s from "./box.module.css";

/** Piezas chicas de la propuesta A: luces de stock, sellos estampados, rótulo de bloque y tornillos de placa. */

const LIGHT: Record<StockState, string> = {
  ok: "bg-(--bx-volt) shadow-[0_0_8px_rgb(200_255_46/0.7)]",
  low: "bg-(--bx-amber) shadow-[0_0_8px_rgb(255_194_26/0.7)]",
  out: "bg-transparent ring-1 ring-inset ring-(--bx-red)",
  "made-to-order": "bg-(--bx-steel-hi)",
};
const STATE_TEXT: Record<StockState, string> = { ok: "En stock", low: "Quedan pocas", out: "Sin stock", "made-to-order": "A pedido" };

export function StockLights({ flavors, className }: { flavors: FlavorLight[]; className?: string }) {
  return (
    <ul aria-label="Stock por sabor" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {flavors.map((f) => (
        <li key={f.name} title={`${f.name}: ${STATE_TEXT[f.state]}`} className="flex items-center">
          <span aria-hidden="true" className={cn("block size-2.5", LIGHT[f.state])} />
          <span className="sr-only">{f.name}: {STATE_TEXT[f.state]}</span>
        </li>
      ))}
    </ul>
  );
}

export function StockLight({ state, className }: { state: StockState; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2.5 shrink-0", LIGHT[state], className)} />;
}

export const stateText = (state: StockState) => STATE_TEXT[state];

const BADGE_TEXT: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "0 azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "0 cafeína",
};

/** Sello estampado con tiza: borde fino, mayúsculas mono. */
export function Stamps({ badges, className }: { badges: ProductBadge[]; className?: string }) {
  if (!badges.length) return null;
  return (
    <ul aria-label="Sellos" className={cn("flex flex-wrap gap-1", className)}>
      {badges.map((b) => (
        <li key={b} className="flex items-center gap-1 border border-(--bx-chalk)/30 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-(--bx-chalk)">
          <BadgeGlyph badge={b} className="size-3" />
          {BADGE_TEXT[b]}
        </li>
      ))}
    </ul>
  );
}

/** Rótulo de bloque pintado en el piso: número de carril + nombre, con marca de carril debajo. */
export function BlockLabel({ n, title, id }: { n: number; title: string; id: string }) {
  return (
    <div className={cn("mx-auto flex max-w-[1360px] items-end gap-3 px-4 pb-3 pt-14 sm:px-8", s.lane)}>
      <span className={cn(s.display, "text-5xl text-(--bx-volt)")} aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <h2 id={id} className="pb-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-(--bx-dim)">
        {n} · {title}
      </h2>
    </div>
  );
}

/** Dos tornillos de placa (decorativos). */
export function Bolts({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none flex justify-between", className)}>
      {[0, 1].map((i) => <span key={i} className="block size-1.5 rounded-full bg-(--bx-steel) shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]" />)}
    </span>
  );
}
