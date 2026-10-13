import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { bestSellers, getCategory } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { ArenaDefs } from "./ArenaPack";
import { ArenaHeader } from "./ArenaHeader";
import { ArenaHero } from "./ArenaHero";
import { ProductFirstScreen } from "./ProductFirstScreen";
import { RackCard } from "./RackCard";
import { TodayBoard } from "./TodayBoard";
import { fichaData, HERO_SLUG, leadVariant, rackCards, requireProduct, tickerFacts, todayBoard, variantFacts } from "./data";
import s from "./arena.module.css";

/** Rótulo chico entre bloques de la maqueta ("1 · Inicio"). */
function BlockLabel({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 pb-4 pt-16 sm:px-8">
      <p className={cn(s.mono, "shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--a-plasma-ink)]")}>{n} · {children}</p>
      <span aria-hidden="true" className="h-px flex-1 bg-[linear-gradient(90deg,var(--a-line),transparent)]" />
    </div>
  );
}

/** Propuesta C · ARENA: la noche de competencia. Cuatro bloques de muestra con datos reales del catálogo y del panel. */
export function ArenaProposal() {
  const hero = requireProduct(HERO_SLUG);
  const heroVariant = leadVariant(hero);
  const ficha = fichaData(hero);
  const ticker = tickerFacts();
  const rank = bestSellers(99).findIndex((p) => p.slug === hero.slug) + 1;
  const tickerItems = [
    "Demo · no se cobra nada",
    `Cadete en MdP: sale ${ticker.cadete}`,
    ...(ticker.coupon ? [`${ticker.coupon.code} · ${ticker.coupon.text}`] : []),
    `Envío gratis desde ${formatARS(ticker.freeFrom)}`,
  ];
  return (
    <div className={cn(s.root, "min-h-dvh pb-24")}>
      <ArenaDefs />
      <BlockLabel n={1}>Inicio · header, ticker y hero</BlockLabel>
      <div className="border-y border-[var(--a-line)]">
        <ArenaHeader brandName={brand.name} ticker={tickerItems} />
        <ArenaHero product={hero} facts={variantFacts(hero, heroVariant)} rank={rank} tint={heroVariant.colorHex} protein={ficha.protein ?? undefined} />
      </div>

      <BlockLabel n={2}>Tarjetas de producto · ficha de rack</BlockLabel>
      <section id="arena-rack" aria-labelledby="arena-rack-h" className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="arena-rack-h" className={cn(s.display, "text-[clamp(2.6rem,6vw,4.75rem)]")}>Los más elegidos<br className="sm:hidden" /> <span className="text-[var(--a-volt)]">del box</span></h2>
          <p className={cn(s.mono, "text-[11px] uppercase tracking-[0.16em] text-[var(--a-muted)]")}>Precio por servicio · imágenes ilustrativas</p>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
          {rackCards().map((c) => <li key={c.product.slug}><RackCard card={c} /></li>)}
        </ul>
      </section>

      <BlockLabel n={3}>Ficha · primer pantallazo</BlockLabel>
      <div className="border-y border-[var(--a-line)] bg-[linear-gradient(180deg,#09090c,var(--a-bg))]">
        <ProductFirstScreen product={hero} categoryName={getCategory(hero.categorySlug)?.name ?? ""} data={ficha} />
      </div>

      <BlockLabel n={4}>Panel · hoy en tu tienda</BlockLabel>
      <div className="border-y border-[var(--a-line)]">
        <TodayBoard board={todayBoard()} storeName={brand.name} />
      </div>
    </div>
  );
}
