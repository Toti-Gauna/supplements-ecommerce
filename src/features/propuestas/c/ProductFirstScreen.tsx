"use client";
import { Bike } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { AddButton } from "./AddButton";
import { ArenaGallery } from "./ArenaGallery";
import { Scoreboard } from "./Scoreboard";
import { BADGE_LABEL, type FichaData } from "./data";
import s from "./arena.module.css";

interface ProductFirstScreenProps {
  product: Product;
  categoryName: string;
  data: FichaData;
}

const plate = (active: boolean) =>
  cn(s.cut, s.cutSm, s.focusCut, "relative flex flex-col text-left",
    active ? "bg-[var(--a-ink)] text-black" : "bg-[var(--a-stage)] text-[var(--a-ink)] hover:bg-[#1a1a21]");

/** Primer pantallazo de la ficha: galería, marcador de datos, sabor y tamaño como placas, stock con lote y compra. */
export function ProductFirstScreen({ product, categoryName, data }: ProductFirstScreenProps) {
  const lead = data.variants.find((v) => v.id === data.lead)!;
  const [flavor, setFlavor] = useState(lead.color);
  const [size, setSize] = useState(lead.size);
  const flavors = [...new Map(data.variants.map((v) => [v.color, v.colorHex])).entries()];
  const sizes = [...new Set(data.variants.map((v) => v.size))];
  const pick = (c = flavor, z = size) => data.variants.find((v) => v.color === c && v.size === z) ?? lead;
  const v = pick();
  return (
    <section aria-labelledby="arena-ficha" className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:py-14">
      <ArenaGallery product={product} tint={v.colorHex ?? undefined} className="lg:self-start" />
      <div className="flex min-w-0 flex-col gap-6">
        <div>
          <p className={cn(s.mono, "text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--a-muted)]")}>{categoryName} / <span className="text-[var(--a-volt)]">{product.brand}</span></p>
          <h2 id="arena-ficha" className={cn(s.display, "mt-3 text-[clamp(3.2rem,7vw,6rem)]")}>{product.name}</h2>
          <p className="mt-3 text-lg text-[var(--a-ink)]/85">{product.short}</p>
          {product.badges && (
            <ul aria-label="Sellos" className="mt-4 flex flex-wrap gap-1.5">
              {product.badges.map((b) => <li key={b} className={cn(s.mono, "border border-[var(--a-line)] px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]")}>{BADGE_LABEL[b]}</li>)}
            </ul>
          )}
        </div>
        <Scoreboard
          flipKey={v.id}
          className="grid-cols-2"
          cells={[
            { label: "Precio", value: formatARS(v.price), note: `${formatARS(v.transfer)} transf.` },
            { label: "Por servicio", value: v.perServing !== null ? formatARS(v.perServing) : "—", tone: "volt" },
            { label: "Servicios", value: v.servings ?? "—" },
            { label: "Proteína", value: data.protein ?? "—", unit: "x serv.", tone: "plasma" },
          ]}
        />
        {flavors.length > 1 && (
          <fieldset>
            <legend className={cn(s.mono, "mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--a-muted)]")}>Sabor · <span className="text-[var(--a-ink)]">{flavor}</span></legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {flavors.map(([name, hex]) => {
                const out = pick(name, size).stock === 0;
                return (
                  <button key={name} type="button" aria-pressed={name === flavor} onClick={() => setFlavor(name)} className={plate(name === flavor)}>
                    <span aria-hidden="true" className="h-2.5 w-full" style={{ background: hex ?? undefined }} />
                    <span className="px-3 py-2.5 text-sm font-extrabold uppercase italic leading-tight">{name}</span>
                    {out && <span className={cn(s.mono, "px-3 pb-2 text-[10px] uppercase", name === flavor ? "text-black/70" : "text-[var(--a-ember)]")}>Sin stock en {size}</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
        {sizes.length > 1 && (
          <fieldset>
            <legend className={cn(s.mono, "mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--a-muted)]")}>Tamaño</legend>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((z) => {
                const sv = pick(flavor, z);
                return (
                  <button key={z} type="button" aria-pressed={z === size} onClick={() => setSize(z)} className={cn(plate(z === size), "gap-1 px-4 py-3")}>
                    {z === data.best && <span className={cn(s.mono, "mb-1 self-start bg-[var(--a-volt)] px-1.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-black sm:absolute sm:right-3 sm:top-2 sm:mb-0")}>Mejor $/serv.</span>}
                    <span className={cn(s.display, "text-3xl")}>{z?.split(" (")[0]}</span>
                    <span className={cn(s.mono, "text-[11px]")}>{sv.servings} servicios</span>
                    {sv.perServing !== null && <span className={cn(s.mono, "text-[11px] font-bold")}>{formatARS(sv.perServing)} / serv.</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
        <div className={cn(s.mono, "flex flex-col gap-2 border-y border-[var(--a-line)] py-3 text-xs")}>
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className={cn(s.ledDot, v.stock > 3 ? "text-[var(--a-volt)]" : v.stock > 0 ? "text-[var(--a-ember)]" : "text-[var(--a-muted)]")} />
            <strong className="text-[var(--a-ink)]">{v.stock > 0 ? `${v.stock} en stock` : "Sin stock"}</strong>
            {v.lot && <span className="text-[var(--a-muted)]">· {v.lot}</span>}
          </p>
          <p className="flex items-center gap-2"><Bike size={14} aria-hidden="true" className="text-[var(--a-plasma-ink)]" />Cadete en MdP: <strong className="text-[var(--a-ink)]">{v.cadete.text}</strong></p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <AddButton key={v.id} soldOut={v.stock === 0} productName={`${product.name} ${v.color ?? ""} ${v.size ?? ""}`.trim()} detail={formatARS(v.price)} className="h-14" classNames={{ label: "text-2xl" }} />
          <button type="button" className={cn(s.slant, "h-14 border border-[var(--a-ink)] px-8 text-sm font-extrabold uppercase italic tracking-[0.06em] hover:bg-[var(--a-ink)] hover:text-black", s.focusCut)}>Comprar ahora</button>
        </div>
      </div>
    </section>
  );
}
