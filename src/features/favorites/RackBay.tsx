"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { LedPrice } from "@/components/atoms/Led";
import { RackShot } from "@/components/illustrations/RackShot";
import { productHref } from "@/demo/engine/catalog";
import type { MyRackItem } from "@/demo/engine/my-rack";
import { rackFacts, stockLine } from "@/demo/engine/rack";
import type { RackAlertStatus } from "@/demo/engine/rack-alerts";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { RackAlertControl } from "./RackAlertControl";

const variantLabel = (i: MyRackItem) => [i.variant.color, i.variant.size].filter(Boolean).join(" · ") || i.variant.label;

/**
 * Un lugar de Mi rack: el pote en su hueco del estante con el número de lugar, marca y nombre, la presentación que
 * cuenta en el total, el precio del pote primero y grande en el marcador (el precio por servicio chico), "te dura" y el
 * aviso simulado. Lo agotado queda en el estante, apagado y fuera del total. En escritorio el precio va a la derecha.
 */
export function RackBay({ item, index, status, onWatch, onUnwatch, onRemove }: {
  item: MyRackItem;
  index: number;
  status: RackAlertStatus | null;
  onWatch: (again: boolean) => void;
  onUnwatch: () => void;
  onRemove: () => void;
}) {
  const { product } = item;
  const facts = rackFacts(product);
  const out = !item.available;
  return (
    <article data-rack-bay={product.slug} className={cn("relative grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-3 border border-line bg-surface p-2.5 pr-10 shadow-[var(--shadow-card)] sm:grid-cols-[136px_minmax(0,1fr)_auto] sm:gap-x-5 sm:p-3 sm:pr-12", status?.kind === "triggered" && "glow-season")}>
      <div className="rack-bay relative aspect-square self-start overflow-hidden sm:row-span-2">
        {product.photoDataUrl
          // eslint-disable-next-line @next/next/no-img-element -- foto cargada en el panel demo (data URL local)
          ? <img src={product.photoDataUrl} alt="" className={cn("h-full w-full object-cover", out && "grayscale")} />
          : <RackShot items={[{ art: product.art, pack: product.pack, tint: item.variant.colorHex }]} label="" className={cn(out && "opacity-50 grayscale")} />}
        <span aria-hidden="true" className="absolute left-0 top-0 bg-night px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.1em] text-volt">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="min-w-0 sm:pt-1">
        {product.brand && <p className="truncate font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-volt-ink">{product.brand}</p>}
        <h3 className="font-display text-xl leading-[0.98] sm:text-[1.7rem]"><Link href={productHref(product.slug)} className="hover:underline">{product.name}</Link></h3>
        <p className="mt-1 truncate font-mono text-[11px] text-muted">{variantLabel(item)}</p>
        <p className="mt-1 font-mono text-[11px]">
          <span className={cn(out ? "font-bold text-danger" : facts.state === "low" ? "font-bold text-warning" : "text-ink")}>{stockLine(facts)}</span>
          {item.servings && <span className="text-muted"> · te dura {item.servings} días</span>}
        </p>
      </div>
      <div className="col-start-2 sm:col-start-3 sm:row-start-1 sm:pt-1 sm:text-right">
        <p className="eyebrow hidden text-[10px] text-muted sm:block">{out ? "Agotado" : "Precio"}</p>
        <div className="sm:mt-1 sm:flex sm:justify-end">
          <LedPrice amount={item.price} tone={out ? "chalk" : "volt"} motion="none" className="h-7 sm:h-9" signClassName="text-lg sm:text-2xl" />
        </div>
        {item.perServing !== null && <p className="mt-1 font-mono text-[11px] text-muted"><span className="text-ink">{formatARS(item.perServing)}</span> por servicio</p>}
      </div>
      <div className="col-span-2 sm:col-span-2 sm:col-start-2">
        <RackAlertControl name={product.name} status={status} onWatch={onWatch} onUnwatch={onUnwatch} />
      </div>
      <button type="button" onClick={onRemove} aria-label={`Quitar ${product.name} de Mi rack`}
        className="absolute right-0.5 top-0.5 grid size-10 place-items-center text-muted transition-colors hover:text-ink sm:right-1 sm:top-1">
        <X size={18} aria-hidden="true" />
      </button>
    </article>
  );
}
