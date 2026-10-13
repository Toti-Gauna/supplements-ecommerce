"use client";
import { useState } from "react";
import type { Nutrition } from "@/demo/types";
import { cn } from "@/lib/cn";
import type { RackItem } from "./data";
import { FichaBuy } from "./FichaBuy";
import { FichaGallery } from "./FichaGallery";
import { Stamps } from "./parts";
import s from "./box.module.css";

interface FichaProps {
  item: RackItem;
  category: string;
  nutrition?: Nutrition;
  arrives: string;
}

/**
 * Primer pantallazo de la ficha: galería a la izquierda y, a la derecha, el nombre como póster y la columna de compra.
 * El sabor elegido tiñe el envase de la galería; el tamaño cambia el marcador (flip).
 */
export function Ficha({ item, category, nutrition, arrives }: FichaProps) {
  const first = item.variants[0]!;
  const [flavor, setFlavor] = useState(first.flavor ?? "");
  const [size, setSize] = useState(first.size ?? "");
  const variant = item.variants.find((v) => v.flavor === flavor && v.size === size) ?? first;
  const pickFlavor = (f: string) => {
    setFlavor(f);
    if (!item.variants.some((v) => v.flavor === f && v.size === size)) setSize(item.variants.find((v) => v.flavor === f)?.size ?? size);
  };
  return (
    <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        <nav aria-label="Migas de pan" className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--bx-dim)">
          <ol className="flex flex-wrap gap-2">
            <li>Inicio /</li><li>{category} /</li><li aria-current="page" className="text-(--bx-chalk)">{item.brand}</li>
          </ol>
        </nav>
        <h3 className={cn(s.display, "mt-4 text-[clamp(52px,7vw,96px)] [text-wrap:balance]")}>{item.name}</h3>
        <p className="mt-3 text-(--bx-dim)">{item.short}.</p>
        <Stamps badges={item.badges} className="mt-3" />
      </div>
      <div className="lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <FichaGallery name={item.name} art={item.art} pack={item.pack} tint={variant.hex} nutrition={nutrition} />
      </div>
      <div className="min-w-0 lg:col-start-2 lg:row-start-2">
        <FichaBuy item={item} variant={variant} flavor={flavor} size={size} onFlavor={pickFlavor} onSize={setSize} arrives={arrives} />
      </div>
    </div>
  );
}
