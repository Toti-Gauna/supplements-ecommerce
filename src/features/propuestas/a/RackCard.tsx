import { Plus } from "lucide-react";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { RackItem } from "./data";
import { LedPrice } from "./Led";
import { Bolts, StockLight, StockLights, Stamps, stateText } from "./parts";
import { RackShot } from "./RackShot";
import { focusRing } from "./styles";
import s from "./box.module.css";


/**
 * "Ficha de rack": un módulo del rack con su número de posición, el envase en el estante, el precio por servicio en
 * el marcador, servicios, sellos, luces de stock por sabor y agregar. Maqueta: agregar no toca el carrito.
 */
export function RackCard({ item, slot }: { item: RackItem; slot: string }) {
  const v = item.lead;
  const nameId = `a-card-${item.slug}`;
  return (
    <article aria-labelledby={nameId} className="group flex h-full flex-col bg-(--bx-graphite)">
      <header className={cn(s.steel, "flex h-8 items-center justify-between gap-2 px-3")}>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-(--bx-volt)">{slot}</span>
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-(--bx-dim)">{item.brand}</span>
        <Bolts className="hidden w-6 sm:flex" />
      </header>
      <a href={item.href} className={cn("relative block h-[180px] bg-(--bx-carbon) sm:h-[270px]", focusRing)} tabIndex={-1} aria-hidden="true">
        <RackShot art={item.art} pack={item.pack} tint={v.hex} label={item.name} uprights={false} className="transition-transform duration-300 group-hover:-translate-y-1" />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <h4 id={nameId} className={cn(s.display, "text-[24px] leading-[0.92] sm:text-[30px]")}>
          <a href={item.href} className={cn("hover:text-(--bx-volt)", focusRing)}>{item.name}</a>
        </h4>
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--bx-dim)">Por servicio{item.variants.length > 1 ? " · desde" : ""}</p>
          <div className="mt-1"><LedPrice amount={v.perServing ?? v.price} suffix=" por servicio" className="h-8 sm:h-10" /></div>
          <p className="mt-1.5 font-mono text-[11px] text-(--bx-chalk)">{v.servings} serv · {v.size}<span className="sm:hidden"> · {formatARS(v.price)}</span></p>
        </div>
        <Stamps badges={item.badges} />
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-(--bx-steel) pt-3">
          <span className="flex items-center gap-2 font-mono text-[11px] text-(--bx-chalk)">
            <StockLight state={v.state} className="sm:hidden" />
            <StockLights flavors={item.flavors} className="hidden sm:flex" />
            <span>{stateText(v.state)}</span>
          </span>
          <span className="font-mono text-[11px] text-(--bx-dim)">{item.units} u</span>
        </div>
        <button type="button" aria-label={`Agregar ${item.name}, ${v.flavor ? `${v.flavor}, ` : ""}${v.size}`} className={cn("flex h-11 items-center justify-center gap-2 bg-(--bx-volt) px-3 sm:justify-between font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-(--bx-volt-ink) shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] hover:brightness-110 active:translate-y-px", focusRing)}>
          <span className="flex items-center gap-1.5"><Plus size={15} aria-hidden="true" />Agregar</span>
          <span className="hidden tabular-nums sm:inline">{formatARS(v.price)}</span>
        </button>
      </div>
    </article>
  );
}
