import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { productView, storeTerms } from "./data";
import { LabHeader } from "./LabHeader";
import { LabPack } from "./LabPack";
import { DataCell, LotTag, Readout, StockLeds } from "./parts";
import s from "./lab.module.css";

const HERO_SLUG = "creatina-monohidrato";

/**
 * Bloque 1: header + ticker + hero. El producto más vendido sobre el banco de pruebas, con sus cotas reales, y la
 * tira de datos que vende (precio por servicio, activo, servicios, stock y cuándo sale) a la vista.
 */
export function HeroBlock() {
  const v = productView(HERO_SLUG);
  const { product: p } = v;
  return (
    <div id="b-inicio" className={cn(s.hero, "border-y border-(--ink)")}>
      <LabHeader dispatch={v.dispatch} />
      <section aria-labelledby="b-hero-title" className={cn(s.mm, "bg-(--paper)")}>
        <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 px-4 pb-10 pt-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:grid-rows-[auto_1fr] lg:pb-14 lg:pt-12">
          <div className="flex flex-col gap-4">
            <p className="flex flex-wrap items-center gap-2">
              <span className={cn(s.tag, "bg-(--volt) px-2 py-1 text-(--ink)")}>Nº {v.rank} del box</span>
              <span className={cn(s.tag, "text-(--ink-2)")}>{v.category} · {p.soldCount} vendidos (muestra)</span>
            </p>
            <h1 id="b-hero-title" className="max-w-[13ch] text-[40px] font-semibold leading-[0.95] tracking-[-0.045em] sm:text-[64px] xl:text-[80px]">
              {p.name}
            </h1>
            <p className="max-w-[44ch] text-[17px] leading-snug text-(--ink-2)">{p.short}. {p.brand}, envase de {v.variant.size}.</p>
          </div>

          <figure className={cn(s.crop, "relative overflow-hidden border border-(--ink) bg-(--card) [--plate:#fcfcfa] lg:col-start-2 lg:row-span-2 lg:row-start-1")}>
            <div aria-hidden="true" className={cn(s.mm, "absolute inset-0")} />
            <LabPack art={p.art} pack={p.pack} tint={v.variant.colorHex} label={p.name} dims={p.dims} figure className="relative block h-auto w-full" />
            <div aria-hidden="true" className={cn(s.scan, "absolute inset-0")} />
            <figcaption className={cn(s.tag, "absolute inset-x-0 top-0 flex justify-between gap-3 px-3 py-2.5 text-(--ink-2)")}>
              <span><span className="hidden sm:inline">Banco 01 · </span>Fig. A</span><span>Imagen ilustrativa</span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-5 lg:self-end">
            <div className="grid grid-cols-2 border-l border-t border-(--ink) bg-(--card) sm:grid-cols-4">
              <DataCell signal>
                <Readout label="$ / servicio" value={v.pps === null ? "—" : formatARS(v.pps)} note={`${formatARS(v.price)} el envase`} size="lg" />
              </DataCell>
              {v.fact && <DataCell><Readout label={v.fact.label} value={v.fact.value} unit={`${v.fact.unit}/serv.`} note={p.usage?.dose ?? ""} delay={90} size="lg" /></DataCell>}
              <DataCell><Readout label="Servicios" value={String(v.variant.servings ?? "—")} note="1 por día" delay={180} size="lg" /></DataCell>
              <DataCell>
                <Readout label="Stock" value={String(v.stock.units ?? "—")} unit="u." delay={270} size="lg" note={<StockLeds state={v.stock.state} text="en el local" />} />
              </DataCell>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px]">
              <span><span className={cn(s.tag, "mr-2 text-(--ion-ink)")}>Cadete MdP</span><strong className="font-semibold">sale {v.dispatch}</strong></span>
              {v.lot && <LotTag code={v.lot.code} expires={v.lot.expires} />}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button type="button" className={cn(s.buy, "inline-flex h-14 items-center gap-3 rounded-[3px] px-6 text-[16px] font-semibold")}>
                <Plus size={18} aria-hidden="true" />Agregar <span className={cn(s.mono, "font-semibold")}>{formatARS(v.price)}</span>
              </button>
              <a href="#b-ficha" className="inline-flex items-center gap-2 text-[15px] font-semibold underline decoration-(--rule-2) underline-offset-[6px] hover:decoration-(--ink)">
                Ver la ficha técnica<ArrowRight size={16} aria-hidden="true" />
              </a>
              <span className={cn(s.mono, "basis-full text-[12px] text-(--ink-2)")}>−{storeTerms.transferPct} % pagando con transferencia</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
