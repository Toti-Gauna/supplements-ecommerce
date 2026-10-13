import Link from "next/link";
import { productHref } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { AddButton } from "./AddButton";
import { ArenaPack } from "./ArenaPack";
import { BADGE_LABEL, type RackCardData } from "./data";
import s from "./arena.module.css";

const STOCK_TONE = {
  ok: "text-[var(--a-volt)]",
  low: "text-[var(--a-ember)]",
  out: "text-[var(--a-muted)]",
  "made-to-order": "text-[var(--a-plasma-ink)]",
} as const;

/**
 * Tarjeta "ficha de rack": dorsal con el puesto en ventas, luz de stock, el envase bajo su reflector (se enciende al
 * pasar el mouse), el precio por servicio como número principal, sellos y "Agregar" que agrega sin salir.
 */
export function RackCard({ card, className }: { card: RackCardData; className?: string }) {
  const { product, bib, perServing, from, servings, stock, tint } = card;
  const id = `rack-${product.slug}`;
  return (
    <article aria-labelledby={id} className={cn(s.card, s.cut, s.frame, "h-full", className)}>
      <div className={cn(s.cut, "flex h-full flex-col")}>
        <div className="flex flex-col items-start justify-between gap-1 px-3 pt-3 sm:flex-row sm:px-4">
          <span className={cn(s.display, s.num, s.outline, "text-[2.4rem] leading-[0.9] text-[var(--a-ink)]/70 sm:text-[3.4rem]")}>
            <span aria-hidden="true">{String(bib).padStart(2, "0")}</span><span className="sr-only">Puesto {bib} en ventas</span>
          </span>
          <span className={cn(s.mono, "flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.08em] sm:mt-2 sm:text-[11px] sm:tracking-[0.1em]", STOCK_TONE[stock.state])}>
            <span aria-hidden="true" className={s.ledDot} />{stock.text}
          </span>
        </div>
        <div className="relative aspect-[1/0.9] overflow-hidden sm:-mt-6">
          <div aria-hidden="true" className={cn(s.beam, s.cardLight, "left-[18%] h-[120%] w-[64%]")} />
          <ArenaPack product={product} tint={tint} backlight={false} className={cn(s.cardPack, "absolute inset-x-[6%] bottom-0 top-[4%]")} />
        </div>
        <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
          <div>
            <p className={cn(s.mono, "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--a-muted)]")}>{product.brand}</p>
            <h3 id={id} className={cn(s.display, "mt-1 line-clamp-2 min-h-[2em] pr-1 text-[1.15rem] leading-[1] sm:text-[1.65rem]")}>
              <Link href={productHref(product.slug)} className="hover:text-[var(--a-volt)] focus-visible:outline-2 focus-visible:outline-[var(--a-volt)]">{product.name}</Link>
            </h3>
          </div>
          <div className="border-t border-[var(--a-line)] pt-3">
            {perServing !== null ? (
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className={cn(s.mono, "text-[11px] text-[var(--a-muted)]")}>desde</span>
                <span className={cn(s.display, s.num, "text-[1.9rem] text-[var(--a-volt)] sm:text-[2.6rem]")}>{formatARS(perServing)}</span>
                <span className={cn(s.mono, "text-[11px] text-[var(--a-muted)]")}>/ serv.</span>
              </p>
            ) : (
              <p className={cn(s.display, s.num, "text-[2.6rem]")}>{formatARS(from)}</p>
            )}
            <p className={cn(s.mono, "mt-1 text-[10.5px] text-[var(--a-muted)] sm:text-xs")}>
              Precio desde <strong className="text-[var(--a-ink)]">{formatARS(from)}</strong>{servings ? ` · ${servings} serv.` : ""}
            </p>
          </div>
          {product.badges && product.badges.length > 0 && (
            <ul aria-label="Sellos" className="flex flex-wrap gap-1.5">
              {product.badges.slice(0, 3).map((b) => (
                <li key={b} className={cn(s.mono, "border border-[var(--a-line)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--a-ink)]/85")}>{BADGE_LABEL[b]}</li>
              ))}
            </ul>
          )}
          <AddButton productName={product.name} className="mt-auto h-11 px-4 sm:h-12 sm:px-6" classNames={{ label: "text-lg sm:text-xl" }} />
        </div>
      </div>
    </article>
  );
}
