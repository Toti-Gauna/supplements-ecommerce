import { ArrowRight, Plus } from "lucide-react";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { RackItem } from "./data";
import { Led, LedPrice } from "./Led";
import { StockLights, stateText } from "./parts";
import { RackShot } from "./RackShot";
import { btnGhost, btnVolt, cellLabel, focusRing } from "./styles";
import s from "./box.module.css";


/**
 * Primer pantallazo del inicio: el producto estrella en el rack bajo el reflector, el nombre como póster de
 * competencia y abajo el marcador con lo que vende (precio por servicio, servicios, stock y cuándo llega).
 */
export function Hero({ item, arrives }: { item: RackItem; arrives: string }) {
  const v = item.lead;
  const [when, ...date] = arrives.split(", ");
  const words = item.name.split(" ");
  return (
    <section id="a-hero" aria-labelledby="a-hero-title" className={cn(s.floor, "relative overflow-hidden")}>
      <div className="relative mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] px-4 pt-7 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-10 lg:pt-14">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-(--bx-dim)">
            <span aria-hidden="true" className="size-2 bg-(--bx-volt) shadow-[0_0_10px_rgb(200_255_46/0.8)]" />
            Estrella del rack · {item.brand}
          </p>
          <h3 id="a-hero-title" className={cn(s.display, "mt-4 text-[clamp(64px,9.5vw,136px)] [text-wrap:balance]")}>
            <span className={cn(s.slam, "block")}>{words.slice(0, -1).join(" ")}</span>
            <span className={cn(s.slam2, "block text-(--bx-volt)")}>{words.at(-1)}</span>
          </h3>
        </div>
        <div className="relative -mx-4 mt-2 h-[300px] sm:mx-0 sm:h-[440px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-[560px]">
          <RackShot art={item.art} pack={item.pack} tint={v.hex} label={item.name} lightUp />
          <span className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.16em] text-(--bx-dim)">Imagen ilustrativa</span>
        </div>
        <div className="pb-6 pt-5 lg:col-start-1 lg:row-start-2 lg:pb-12">
          <p className="max-w-[34ch] text-lg text-(--bx-dim)">{item.short}.</p>
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-2 sm:flex sm:flex-wrap">
            <button type="button" className={cn(btnVolt, "inline-flex h-12 items-center justify-center gap-2 px-5 text-[13px] tracking-[0.1em]", focusRing)}>
              <Plus size={16} aria-hidden="true" /> Agregar · {formatARS(v.price)}
            </button>
            <a href="#a-ficha" className={cn(btnGhost, "inline-flex h-12 items-center justify-center gap-2 px-5 text-[13px] tracking-[0.1em]", focusRing)}>
              Ver ficha <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <p className="mt-3 font-mono text-xs text-(--bx-dim)">{formatARS(v.transfer)} con transferencia · {v.size}</p>
        </div>
      </div>
      {/* Marcador: módulos de acero que encastran, separados por la luz entre placas. */}
      <div className="relative mx-auto max-w-[1360px] sm:px-8">
      <dl className="grid grid-cols-2 gap-px border-t border-(--bx-carbon) bg-(--bx-carbon) lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className={cn(s.steel, "col-span-2 flex flex-col gap-2 p-4 sm:p-5 lg:col-span-1")}>
          <dt className={cellLabel}>Precio por servicio · desde</dt>
          <dd><LedPrice amount={v.perServing ?? v.price} suffix=" por servicio" className="h-14 sm:h-16" signClassName="text-4xl" /></dd>
        </div>
        <div className={cn(s.steel, "flex flex-col gap-2 p-4 sm:p-5")}>
          <dt className={cellLabel}>Servicios</dt>
          <dd><Led value={String(v.servings ?? 1)} label={`${v.servings} servicios`} tone="chalk" className="h-10" /><span className="mt-2 block font-mono text-xs text-(--bx-dim)">{v.size}</span></dd>
        </div>
        <div className={cn(s.steel, "flex flex-col gap-2 p-4 sm:p-5")}>
          <dt className={cellLabel}>Stock por sabor</dt>
          <dd className="flex flex-col gap-2">
            <StockLights flavors={item.flavors} />
            <span className="font-mono text-xs text-(--bx-chalk)">{item.units} u · {stateText(v.state)}</span>
          </dd>
        </div>
        <div className={cn(s.steel, "col-span-2 flex flex-col gap-3 p-4 sm:p-5 lg:col-span-1")}>
          <dt className={cellLabel}>Cadete en Mar del Plata</dt>
          <dd className="flex flex-col gap-1">
            <span className={cn(s.display, "text-[44px] text-(--bx-chalk)")}>Llega {when}</span>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-(--bx-dim)">{date.join(", ")} · en stock</span>
          </dd>
        </div>
      </dl>
      </div>
    </section>
  );
}
