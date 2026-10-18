"use client";
import Link from "next/link";
import { Led, LedPrice, type LedTone } from "@/components/atoms/Led";
import type { TodayScore } from "@/demo/engine/today-score";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";

interface Cell {
  key: string;
  label: string;
  value: number;
  money?: boolean;
  /** Lectura completa del número para lectores de pantalla. */
  reading: string;
  hint: string;
  href: string;
  tone: LedTone;
}

function cells(s: TodayScore): Cell[] {
  const next = formatDay(s.leaving.nextCadeteDay).replace(",", "");
  return [
    { key: "vendido", label: "Vendido hoy", value: s.sold.amount, money: true, reading: formatARS(s.sold.amount), tone: "volt", href: "/admin-demo/pedidos/",
      hint: `${plural(s.sold.orders, "pedido", "pedidos")} · 7 días: ${formatARS(s.sold.week)}` },
    { key: "cobrar", label: "Por cobrar", value: s.toCollect.amount, money: true, reading: formatARS(s.toCollect.amount), tone: s.toCollect.receipts ? "amber" : "chalk", href: "/admin-demo/pagos/",
      hint: `${plural(s.toCollect.receipts, "comprobante", "comprobantes")} por revisar · ${s.toCollect.orders - s.toCollect.receipts} sin pagar` },
    { key: "armar", label: "Para armar", value: s.toPack.count, reading: plural(s.toPack.count, "pedido", "pedidos"), tone: s.toPack.late ? "amber" : "chalk", href: "/admin-demo/preparacion/",
      hint: s.toPack.late ? plural(s.toPack.late, "atrasado", "atrasados") : "Todos a tiempo" },
    { key: "sale", label: "Sale hoy", value: s.leaving.cadete, reading: plural(s.leaving.cadete, "pedido con el cadete", "pedidos con el cadete"), tone: "chalk", href: "/admin-demo/despachos/",
      hint: `Cupo ${s.leaving.slotsUsed}/${s.leaving.capacity}${s.leaving.pickup ? ` · ${s.leaving.pickup} retiran` : ""} · próximo ${next}` },
    { key: "stock", label: "Stock en riesgo", value: s.stockRisk.count, reading: plural(s.stockRisk.count, "variante", "variantes"), tone: s.stockRisk.out ? "amber" : "chalk", href: "/admin-demo/productos/?ver=variantes&stock=reponer",
      hint: `${s.stockRisk.out} sin stock · ${s.stockRisk.count - s.stockRisk.out} bajas` },
  ];
}

/**
 * Marcador del día (R4a): placas de acero con la cifra en LED. Cada placa lleva a donde vive ese número. En el
 * celular, la plata va de a dos arriba y los contadores de a tres abajo; en escritorio, las cinco en una fila.
 */
export function TodayScoreboard({ score }: { score: TodayScore }) {
  return (
    <section aria-labelledby="marcador">
      <h2 id="marcador" className="sr-only">Marcador de hoy</h2>
      <ul className="grid grid-cols-6 gap-px overflow-hidden rounded-sm border border-line bg-line lg:grid-cols-[1.3fr_1.3fr_1fr_1fr_1fr]">
        {cells(score).map((c) => (
          <li key={c.key} data-score={c.key} className={cn("flex min-w-0 lg:col-span-1", c.money ? "col-span-3" : "col-span-2")}>
            <Link href={c.href} className="plate group flex min-w-0 flex-1 flex-col gap-2 p-3 transition-colors hover:bg-accent/40 focus-visible:-outline-offset-2 sm:p-4">
              <span className="eyebrow leading-tight text-muted group-hover:text-ink">{c.label}</span>
              <span className="min-h-8 sm:min-h-10">
                {c.money
                  ? <LedPrice amount={c.value} tone={c.tone} className="h-6! min-[400px]:h-7! sm:h-9! lg:h-10!" signClassName="text-xl sm:text-3xl" />
                  : <Led value={String(c.value).padStart(2, "0")} label={c.reading} tone={c.tone} className="h-7! sm:h-9! lg:h-10!" />}
              </span>
              <span className="font-mono text-[11px] leading-snug text-muted">{c.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
