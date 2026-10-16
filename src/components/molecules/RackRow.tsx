import { LedPrice } from "@/components/atoms/Led";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import type { SearchRowFacts, ShelfStock } from "@/demo/engine/search-row";
import type { ArtKey, PackStyle } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/**
 * Fila de rack: el pote en su estante, marca y nombre, el precio del producto en el marcador (con el precio por servicio
 * chico abajo) y la luz de stock. La usa
 * el buscador para los resultados en vivo (sin abrir la ficha se ve lo que decide la compra).
 */
export interface RackRowData {
  name: string;
  brand?: string;
  art: ArtKey;
  pack?: PackStyle;
  photoUrl?: string;
  tint?: string;
  facts: SearchRowFacts;
}

const LIGHT: Record<ShelfStock, string> = {
  ok: "bg-success",
  low: "bg-warning",
  out: "bg-transparent ring-1 ring-inset ring-danger",
  "made-to-order": "bg-muted",
};

function stockText(stock: ShelfStock, units: number): string {
  if (stock === "low") return `Quedan ${units}`;
  return { ok: "En stock", out: "Sin stock", "made-to-order": "A pedido", low: "" }[stock];
}

export function RackRow({ item, active, className }: { item: RackRowData; active?: boolean; className?: string }) {
  const { facts } = item;
  const out = facts.stock === "out";
  // Un envase de un solo servicio (bloque de tiza, shaker) se lee mejor como precio común.
  const perServing = facts.perServing !== null && (facts.servings ?? 0) > 1;
  return (
    <div className={cn("relative flex items-center gap-3 border border-line bg-surface p-2 pr-3 transition-colors sm:gap-4", active && "border-ink/60 bg-accent", className)}>
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1 bg-volt transition-opacity", active ? "opacity-100" : "opacity-0")} />
      <span className="plate grid size-16 shrink-0 place-items-center overflow-hidden sm:size-[72px]">
        <ProductVisual art={item.art} pack={item.pack} photoUrl={item.photoUrl} tint={item.tint} label="" showBadge={false} className={cn("size-full", out && "grayscale")} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {item.brand && <span className="truncate font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-volt-ink">{item.brand}</span>}
        <span className="font-display line-clamp-2 text-lg leading-[1.05] text-ink sm:text-xl">{item.name}</span>
        <span className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("inline-block size-2", LIGHT[facts.stock])} />
            <span className={cn(out && "font-bold text-danger", facts.stock === "low" && "font-bold text-warning")}>{stockText(facts.stock, facts.units)}</span>
          </span>
          {perServing && <span>{facts.servings} serv · {facts.size}</span>}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{facts.from ? "Desde" : "Precio"}</span>
        <LedPrice amount={facts.price} tone={out ? "chalk" : "volt"} motion="none" className="h-6 sm:h-7" signClassName="text-lg" />
        {perServing && <span className="font-mono text-[11px] tabular-nums text-muted">{formatARS(facts.perServing!)} / serv</span>}
      </span>
    </div>
  );
}
