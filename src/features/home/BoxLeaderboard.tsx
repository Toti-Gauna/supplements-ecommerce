"use client";
import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Led, LedPrice } from "@/components/atoms/Led";
import { productHref } from "@/demo/engine/catalog";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { RankRow } from "@/demo/engine/home";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/date";
import { plural } from "@/lib/plural";
import { HomeBlockTitle } from "./HomeBlockTitle";

/** Cambio de puesto contra la semana anterior: ▲ subió, ▼ bajó, — igual. */
function Move({ move }: { move: number }) {
  const Icon = move > 0 ? ArrowUp : move < 0 ? ArrowDown : Minus;
  const text = move > 0 ? `subió ${plural(move, "puesto", "puestos")}` : move < 0 ? `bajó ${plural(-move, "puesto", "puestos")}` : "igual que la semana pasada";
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[11px] font-bold", move > 0 ? "text-success" : move < 0 ? "text-danger" : "text-muted")}>
      <Icon size={13} aria-hidden="true" /><span aria-hidden="true">{move === 0 ? "=" : Math.abs(move)}</span><span className="sr-only">{text}</span>
    </span>
  );
}

const TH = "eyebrow px-2 py-2 text-left font-bold text-muted sm:px-3";

/**
 * "El más elegido del box": tabla de posiciones de la semana, como el pizarrón de un box. Puesto en LED, unidades
 * vendidas, cambio contra la semana anterior y precio por servicio. Ventas de muestra (fixtures).
 */
export function BoxLeaderboard({ rows, n }: { rows: RankRow[]; n: number }) {
  if (!rows.length) return null;
  return (
    <section aria-labelledby="ranking-title">
      <HomeBlockTitle id="ranking-title" n={n} kicker="Tabla de la semana" title="El más elegido del box" action={{ href: "/categorias/", label: "Ver todo" }} />
      <div className="overflow-hidden border border-line bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full table-fixed border-collapse text-sm">
          <caption className="sr-only">Los 5 productos más vendidos de la semana, con el cambio de puesto y el precio por servicio</caption>
          <colgroup><col className="w-14 sm:w-20" /><col /><col className="w-[4.5rem] sm:w-36" /><col className="w-[6.5rem] sm:w-48" /></colgroup>
          <thead className="plate">
            <tr><th scope="col" className={TH}>Pos.</th><th scope="col" className={TH}>Producto</th><th scope="col" className={TH}>Semana</th><th scope="col" className={cn(TH, "text-right")}>Por servicio</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.product.slug} className={cn("border-t border-line", r.rank === 1 && "bg-[color-mix(in_srgb,var(--season-accent)_7%,transparent)]")}>
                <td className="px-2 py-3 sm:px-3"><Led value={String(r.rank).padStart(2, "0")} label={`Puesto ${r.rank}`} tone={r.rank === 1 ? "volt" : "chalk"} motion="none" className="h-7 sm:h-8" /></td>
                <th scope="row" className="min-w-0 px-2 py-3 text-left font-normal sm:px-3">
                  <Link href={productHref(r.product.slug)} className="font-display block truncate text-lg leading-none hover:underline sm:text-xl">{r.product.name}</Link>
                  <span className="mt-1 block truncate font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">{r.product.brand}</span>
                </th>
                <td className="px-2 py-3 sm:px-3">
                  <span className="block font-mono text-sm font-bold tabular-nums">{r.week} u</span>
                  <Move move={r.move} />
                </td>
                <td className="px-2 py-3 text-right sm:px-3">
                  {r.perServing ? <span className="inline-flex justify-end"><LedPrice amount={r.perServing} suffix=" por servicio" motion="none" className="h-6 sm:h-7" signClassName="text-lg" /></span> : <span className="text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Ventas de muestra de la demo · semana al {formatDay(DEMO_TODAY, "long").replace(",", "")}</p>
    </section>
  );
}
