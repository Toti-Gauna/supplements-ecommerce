import type { StockState } from "@/demo/admin/stock";
import { cn } from "@/lib/cn";

export interface StockLightItem {
  id: string;
  label: string;
  state: StockState;
}

/** Luz de stock: verde hay, ámbar quedan pocas, roja apagada sin stock, gris a pedido. */
const LIGHT: Record<StockState, string> = {
  ok: "bg-success shadow-[0_0_6px_color-mix(in_srgb,var(--color-success)_70%,transparent)]",
  low: "bg-warning shadow-[0_0_6px_color-mix(in_srgb,var(--color-warning)_70%,transparent)]",
  out: "bg-transparent ring-1 ring-inset ring-danger",
  "made-to-order": "bg-muted",
};
export const STOCK_WORD: Record<StockState, string> = { ok: "en stock", low: "quedan pocas", out: "sin stock", "made-to-order": "a pedido" };

/** Una luz por variante (sabor · tamaño), como el tablero de un rack. La lectura completa va para lectores de pantalla. */
export function StockLights({ items, className }: { items: StockLightItem[]; className?: string }) {
  return (
    <ul aria-label="Stock por variante" className={cn("flex flex-wrap items-center gap-1", className)}>
      {items.map((l) => (
        <li key={l.id} title={`${l.label}: ${STOCK_WORD[l.state]}`} className="flex">
          <span aria-hidden="true" className={cn("block size-2", LIGHT[l.state])} />
          <span className="sr-only">{l.label}: {STOCK_WORD[l.state]}</span>
        </li>
      ))}
    </ul>
  );
}

/** Una sola luz (el estado del producto entero). */
export function StockLight({ state, className }: { state: StockState; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0", LIGHT[state], className)} />;
}
