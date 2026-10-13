import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { storeTerms } from "./data";
import { InView } from "./InView";
import { LabPack } from "./LabPack";
import { FlavorPlates, SizePlates } from "./OptionPlates";
import { DataCell, LotTag, Readout, Seals, StockLeds } from "./parts";
import { SheetGallery } from "./SheetGallery";
import { sheetView } from "./sheet-data";
import s from "./lab.module.css";

const SHEET_SLUG = "ionic-whey";

/**
 * Bloque 3: primer pantallazo de la ficha como hoja técnica. Galería de placas, marcador de datos (proteína, precio
 * por servicio, servicios, energía), sabor y tamaño como placas, y la compra con lote y fechas reales del engine.
 */
export function ProductSheet() {
  const v = sheetView(SHEET_SLUG);
  const { product: p, variant } = v;
  return (
    <section id="b-ficha" aria-labelledby="b-sheet-title" className={cn(s.mm, "border-y border-(--ink) bg-(--paper)")}>
      <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <div className="order-2 lg:order-1"><SheetGallery view={v} /></div>
        <div className="order-1 flex min-w-0 flex-col gap-5 lg:order-2">
          <div className="flex gap-3">
            {/* En el celular el envase chico acompaña al nombre: el primer pantallazo ya dice qué es. */}
            <span aria-hidden="true" className={cn(s.mm, "w-24 shrink-0 self-start border border-(--ink) bg-(--card) [--plate:#fcfcfa] lg:hidden")}>
              <LabPack art={p.art} pack={p.pack} tint={variant.colorHex} label={p.name} size={0.95} className="block h-auto w-full" />
            </span>
            <div className="min-w-0">
              <p className={cn(s.tag, "text-(--ink-2)")}>Tienda / {v.category} / {p.brand}</p>
              <h2 id="b-sheet-title" className="mt-2 text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[52px]">{p.name}</h2>
              <p className="mt-2 text-[15px] text-(--ink-2) sm:text-[16px]">{p.short}</p>
              <Seals badges={v.badges} className="mt-3" />
            </div>
          </div>
          <InView className="grid grid-cols-2 border-l border-t border-(--ink) bg-(--card) sm:grid-cols-4">
            {v.protein && <DataCell signal><Readout label="Proteína" value={v.protein.value} unit={`${v.protein.unit}/scoop`} size="md" /></DataCell>}
            <DataCell><Readout label="$ / serv." value={v.pps === null ? "—" : formatARS(v.pps)} size="md" delay={90} /></DataCell>
            <DataCell><Readout label="Servicios" value={String(variant.servings ?? "—")} size="md" delay={180} /></DataCell>
            {v.kcal && <DataCell><Readout label="Energía" value={v.kcal.value} unit={v.kcal.unit} size="md" delay={270} /></DataCell>}
          </InView>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={cn(s.mono, "text-[40px] font-semibold leading-none tracking-[-0.04em]")}>{formatARS(v.price)}</span>
            <span className="text-[13.5px] text-(--ink-2)">{variant.label} · −{storeTerms.transferPct} % con transferencia</span>
          </p>
          <FlavorPlates flavors={v.flavors} label={p.optionNames?.color} />
          <SizePlates sizes={v.sizes} savingsPct={v.savingsPct} label={p.optionNames?.size} />
          <div className="flex gap-2">
            <div className="flex h-14 items-center border border-(--ink) bg-(--card)">
              <button type="button" aria-label="Uno menos" className="grid h-full w-11 place-items-center"><Minus size={16} aria-hidden="true" /></button>
              <span className={cn(s.mono, "w-8 text-center text-[16px] font-semibold")}><span className="sr-only">Cantidad: </span>1</span>
              <button type="button" aria-label="Uno más" className="grid h-full w-11 place-items-center"><Plus size={16} aria-hidden="true" /></button>
            </div>
            <button type="button" className={cn(s.buy, "flex h-14 flex-1 items-center justify-center gap-3 rounded-[3px] text-[16px] font-semibold")}>
              Agregar<span className="-ml-2 hidden sm:inline">a la bolsa</span> <span className={s.mono}>{formatARS(v.price)}</span>
            </button>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-(--ink) pt-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
            <div className="flex flex-col gap-2">
              <StockLeds state={v.stock.state} text={v.stock.text} />
              {v.lot && <LotTag code={v.lot.code} expires={v.lot.expires} />}
              <span className={cn(s.mono, "text-[11px] text-(--ink-2)")}>FEFO: sale primero el que vence antes</span>
            </div>
            <dl className={cn(s.mono, "grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 gap-y-1.5 text-[12.5px]")}>
              {v.windows.map((w) => (
                <div key={w.label} className="contents"><dt className="text-(--ink-2)">{w.label}</dt><dd className="text-right font-semibold">{w.when}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
