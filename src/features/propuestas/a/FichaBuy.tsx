"use client";
import { Bell, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { RackItem, VariantFacts } from "./data";
import { Led, LedPrice } from "./Led";
import { StockLight, stateText } from "./parts";
import { Plates, type PlateOption } from "./Plates";
import { cellLabel, focusRing } from "./styles";
import s from "./box.module.css";


interface Props {
  item: RackItem;
  variant: VariantFacts;
  flavor: string;
  size: string;
  onFlavor: (f: string) => void;
  onSize: (s: string) => void;
  arrives: string;
}

/** Columna de compra de la ficha: marcador de datos, sabor y tamaño como placas, cantidad y botones. */
export function FichaBuy({ item, variant: v, flavor, size, onFlavor, onSize, arrives }: Props) {
  const [qty, setQty] = useState(1);
  const less = () => setQty((q) => q - 1);
  const more = () => setQty((q) => q + 1);
  const flavors = item.flavors.map<PlateOption>((f) => ({
    value: f.name, label: `${f.name}, ${stateText(f.state)}`,
    content: (
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="h-8 w-1.5 shrink-0" style={{ background: f.hex }} />
        <span className="font-mono text-[12px] font-bold uppercase leading-tight">{f.name}</span>
        <StockLight state={f.state} className="ml-auto" />
      </span>
    ),
  }));
  const sizes = item.variants.filter((x) => x.flavor === flavor).map<PlateOption>((x) => ({
    value: x.size!, label: `${x.size}, ${x.servings} servicios, ${formatARS(x.perServing ?? 0)} por servicio${x.stock === 0 ? ", sin stock" : ""}`,
    tag: x.size === item.bestSize ? "Mejor $/serv" : undefined,
    content: (
      <>
        <span className={cn(s.display, "text-3xl")}>{x.size!.split(" (")[0]}</span>
        <span className="font-mono text-[11px] text-(--bx-dim)">{x.servings} serv · {formatARS(x.perServing ?? 0)}/serv</span>
        {x.stock === 0 && <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-(--bx-red)">Sin stock</span>}
      </>
    ),
  }));
  const out = v.stock === 0;
  const units = Math.max(0, v.stock);
  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-px bg-(--bx-carbon)">
        <div className={cn(s.steel, "col-span-2 grid grid-cols-[minmax(0,1fr)] items-end gap-x-3 gap-y-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto]")}>
          <dt className={cn(cellLabel, "sm:col-span-2")}>Precio · {v.size}</dt>
          <dd><LedPrice key={v.id} amount={v.price} motion="flip" className="h-12 sm:h-14" signClassName="text-4xl" /></dd>
          <dd className="font-mono text-xs text-(--bx-chalk) sm:text-right">{formatARS(v.transfer)} <span className="text-(--bx-dim)">con transferencia</span></dd>
        </div>
        <div className={cn(s.steel, "flex flex-col gap-2 p-4")}>
          <dt className={cellLabel}>Por servicio</dt>
          <dd><LedPrice key={v.id} amount={v.perServing ?? v.price} suffix=" por servicio" motion="flip" className="h-8" signClassName="text-xl" /></dd>
        </div>
        <div className={cn(s.steel, "flex flex-col gap-2 p-4")}>
          <dt className={cellLabel}>Servicios</dt>
          <dd><Led key={v.id} value={String(v.servings ?? 0)} label={`${v.servings} servicios`} tone="chalk" motion="flip" className="h-8" /></dd>
        </div>
        <div className={cn(s.steel, "flex flex-col gap-1.5 p-4")}>
          <dt className={cellLabel}>Stock</dt>
          <dd className="flex items-center gap-2 font-mono text-[13px] font-bold"><StockLight state={v.state} />{out ? "Sin stock" : `${units} u · ${stateText(v.state)}`}</dd>
        </div>
        <div className={cn(s.steel, "flex flex-col gap-1.5 p-4")}>
          <dt className={cellLabel}>Cadete MdP</dt>
          <dd className="font-mono text-[13px] font-bold uppercase">Llega {arrives}</dd>
        </div>
        {v.lot && (
          <div className={cn(s.steel, "col-span-2 flex items-center justify-between gap-3 px-4 py-2.5")}>
            <dt className={cellLabel}>Lote que sale</dt>
            <dd className="font-mono text-xs text-(--bx-chalk)">{v.lot} · vence {v.expires}</dd>
          </div>
        )}
      </dl>
      <Plates legend="Sabor" current={flavor} name="a-sabor" value={flavor} options={flavors} onChange={onFlavor} />
      <Plates legend="Tamaño" current={size} name="a-tamano" value={size} options={sizes} onChange={onSize} />
      {out && (
        <p role="status" className="flex items-stretch bg-(--bx-graphite) font-mono text-xs">
          <span aria-hidden="true" className={cn(s.hazard, "w-3 shrink-0")} />
          <span className="px-3 py-2.5">{flavor} en {size} está sin stock. Te avisamos cuando vuelva.</span>
        </p>
      )}
      <div className="flex gap-2">
        <div className="flex h-12 items-center border border-(--bx-steel)" role="group" aria-label="Cantidad">
          <button type="button" aria-label="Uno menos" disabled={qty <= 1 || out} onClick={less} className={cn("grid size-11 place-items-center disabled:opacity-40", focusRing)}><Minus size={16} aria-hidden="true" /></button>
          <output aria-live="polite" className="w-8 text-center font-mono text-sm font-bold tabular-nums">{qty}</output>
          <button type="button" aria-label="Uno más" disabled={qty >= Math.min(10, units) || out} onClick={more} className={cn("grid size-11 place-items-center disabled:opacity-40", focusRing)}><Plus size={16} aria-hidden="true" /></button>
        </div>
        <button type="button" className={cn("flex h-12 flex-1 items-center justify-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.1em]", out ? "border border-(--bx-amber) text-(--bx-amber)" : "bg-(--bx-volt) text-(--bx-volt-ink) shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] hover:brightness-110", focusRing)}>
          {out ? <><Bell size={16} aria-hidden="true" /> Avisame</> : <><Plus size={16} aria-hidden="true" /> Agregar al carrito</>}
        </button>
      </div>
      {!out && <button type="button" className={cn("h-12 border border-(--bx-steel-hi)/50 font-mono text-[13px] font-bold uppercase tracking-[0.1em] hover:border-(--bx-chalk)", focusRing)}>Comprar ahora</button>}
    </div>
  );
}
