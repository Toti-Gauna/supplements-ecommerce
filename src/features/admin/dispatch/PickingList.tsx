"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { PickRow } from "@/demo/admin/dispatch";
import { getProduct } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";

/**
 * Lista de armado consolidada (R4b): cuántos potes de cada variante hay que juntar para todos los pedidos pagados que
 * salen ese día, con el lote que sale y de qué pedidos son. Lo ya juntado (pedidos en control de lote) se marca.
 */
export function PickingList({ rows, dayText }: { rows: PickRow[]; dayText: string }) {
  const units = rows.reduce((s, r) => s + r.quantity, 0);
  const orders = new Set(rows.flatMap((r) => r.orders.map((o) => o.code))).size;
  return (
    <section aria-labelledby="lista-armado" className="flex min-w-0 flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5">
      <header>
        <h2 id="lista-armado" className="text-lg font-extrabold">Lista de armado</h2>
        <p className="text-sm text-muted">{rows.length ? `${plural(units, "pote", "potes")} de ${plural(rows.length, "variante", "variantes")} para ${plural(orders, "pedido", "pedidos")} · ${dayText}` : `Nada para juntar · ${dayText}`}</p>
      </header>
      {rows.length === 0 ? <p className="rounded-sm border border-dashed border-ink/15 p-4 text-center text-sm text-muted">Ese día no sale ningún pedido pagado sin armar. Los que falta cobrar aparecen cuando se aprueba el pago.</p> : (
      <ul className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">
        {rows.map((r) => {
          const p = getProduct(r.productSlug);
          const v = p?.variants.find((x) => x.id === r.variantId);
          const all = r.gathered === r.quantity;
          return (
            <li key={r.key} data-pick={r.key} className="grid grid-cols-[3rem_2.75rem_minmax(0,1fr)] items-center gap-3 bg-surface px-3 py-3">
              <span className="font-lab text-right text-2xl font-bold tabular-nums">{r.quantity}<span className="text-base text-muted">×</span></span>
              <span className="w-11">{p && <LineThumb art={p.art} pack={p.pack} tint={v?.colorHex} name={p.name} />}</span>
              <span className="min-w-0 text-sm">
                <span className="block font-bold leading-snug">{r.name}</span>
                {r.variant && <span className="block text-muted">{r.variant}</span>}
                <span className="font-lab mt-1 inline-block rounded-md bg-night px-1.5 py-0.5 text-[11px] font-bold text-volt">Sale lote {r.lot}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {r.orders.map((o) => (
                    <Link key={o.code} href={`/admin-demo/preparacion/?codigo=${o.code}`}
                      className={cn("inline-flex min-h-7 items-center gap-1 rounded-xs border px-1.5 font-mono text-[11px] font-bold", o.gathered ? "border-success/40 bg-success-soft text-success" : "border-line bg-accent text-ink hover:border-ink/40")}>
                      {o.gathered && <Check size={12} aria-hidden="true" />}{o.quantity} · {o.code}<span className="sr-only">{o.gathered ? " (ya juntado)" : " (falta juntar)"}</span>
                    </Link>
                  ))}
                  <span className={cn("text-xs font-bold", all ? "text-success" : "text-muted")}>{all ? "Todo junto" : `${r.gathered} de ${r.quantity} juntos`}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      )}
    </section>
  );
}
