"use client";
import type { ReactNode } from "react";
import { groupByPack } from "@/demo/engine/pack-cart";
import type { Quote, QuotedLine } from "@/demo/engine/pricing";
import { PackGroup } from "./PackGroup";

/** Las líneas cotizadas del carrito con cada pack agrupado bajo su encabezado; `renderLine` dibuja una línea (`inPack`: va dentro de un pack). */
export function QuotedGroups({ quote, renderLine }: { quote: Quote; renderLine: (q: QuotedLine, inPack: boolean) => ReactNode }) {
  return <>{groupByPack(quote.lines).map((g) =>
    g.packId ? (
      <PackGroup key={`pack-${g.packId}`} packId={g.packId} entry={quote.pack.entries.find((e) => e.packId === g.packId)}>
        {g.items.map((q) => renderLine(q, true))}
      </PackGroup>
    ) : g.items.map((q) => renderLine(q, false)),
  )}</>;
}
