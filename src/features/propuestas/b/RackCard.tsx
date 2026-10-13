import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import type { ProductView } from "./data";
import { LabPack } from "./LabPack";
import { Readout, Seals, StockLeds } from "./parts";
import s from "./lab.module.css";

/**
 * Tarjeta "ficha de rack": el precio por servicio manda, abajo la hoja de datos (servicios, envase, precio), los
 * sellos, las luces de stock con el día de despacho y un solo botón de compra que encastra en voltio.
 */
export function RackCard({ view, slot }: { view: ProductView; slot: string }) {
  const { product: p, variant } = view;
  const titleId = `b-card-${p.slug}`;
  return (
    <article aria-labelledby={titleId} className={cn(s.crop, "flex min-w-0 flex-col border border-(--ink) bg-(--card)")}>
      <div className="flex items-center justify-between gap-2 border-b border-(--ink) px-2.5 py-2 sm:px-3">
        <span className={cn(s.tag, "truncate text-(--ink-2)")}>{slot} · {view.category}</span>
        {p.isNew && <span className={cn(s.tag, "shrink-0 bg-(--ion) px-1.5 py-0.5 text-(--ink)")}>Nuevo</span>}
      </div>
      <Link href={view.href} tabIndex={-1} aria-hidden="true" className={cn(s.mm, "relative block bg-(--paper) [--plate:#f3f3ef]")}>
        <LabPack art={p.art} pack={p.pack} tint={variant.colorHex} label={p.name} size={1.05} className="block aspect-[6/5] h-auto w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-2.5 pb-3 pt-3 sm:px-3.5 sm:pb-3.5">
        <div>
          <p className={cn(s.tag, "text-[9.5px] text-(--ink-2)")}>{p.brand}</p>
          <h3 id={titleId} className="mt-1 text-[15px] font-semibold leading-tight tracking-[-0.01em] sm:text-[17px]">
            <Link href={view.href} className="hover:underline">{p.name}</Link>
          </h3>
        </div>
        <div className="border-t border-(--ink) pt-2.5">
          <Readout label="$ / servicio" value={view.pps === null ? "—" : formatARS(view.pps)} size="md" />
          {view.fact && <p className={cn(s.mono, "mt-1.5 text-[12px] font-semibold text-(--ion-ink)")}>{view.fact.value} {view.fact.unit} {view.fact.label} / serv.</p>}
        </div>
        <dl className={cn(s.mono, "grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-y border-dashed border-(--rule-2) py-2 text-[11.5px] sm:text-[12px]")}>
          <dt className="text-(--ink-2)">Servicios</dt><dd className="text-right font-semibold">{variant.servings ?? "—"}</dd>
          <dt className="text-(--ink-2)">Envase</dt><dd className="truncate text-right font-semibold">{variant.size ?? variant.label}</dd>
          <dt className="text-(--ink-2)">Precio</dt><dd className="text-right font-semibold">{formatARS(view.price)}</dd>
        </dl>
        <Seals badges={view.badges} />
        <div className="mt-auto flex flex-col gap-2.5">
          <p className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <StockLeds state={view.stock.state} text={view.stock.text} />
            <span className={cn(s.mono, "text-[11.5px] text-(--ink-2)")}>sale {view.dispatch}</span>
          </p>
          <button type="button" aria-label={`Agregar ${p.name} a la bolsa`} className={cn(s.buy, "flex h-11 items-center justify-center gap-2 rounded-[3px] text-[14.5px] font-semibold")}>
            <Plus size={16} aria-hidden="true" />Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
