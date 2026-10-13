import { getCategory, getProduct } from "@/demo/engine/catalog";
import { demoData } from "@/demo/engine/source";
import { BoxHeader } from "@/features/propuestas/a/BoxHeader";
import { cadeteWhen, FICHA_SLUG, HERO_SLUG, RACK_SLUGS, rackItem } from "@/features/propuestas/a/data";
import { Ficha } from "@/features/propuestas/a/Ficha";
import { Hero } from "@/features/propuestas/a/Hero";
import { panelToday } from "@/features/propuestas/a/panel-data";
import { PanelToday } from "@/features/propuestas/a/PanelToday";
import { BlockLabel } from "@/features/propuestas/a/parts";
import { RackCard } from "@/features/propuestas/a/RackCard";
import { SlotIn } from "@/features/propuestas/a/SlotIn";
import { Ticker } from "@/features/propuestas/a/Ticker";
import s from "@/features/propuestas/a/box.module.css";
import { formatARS } from "@/lib/money";

/** Propuesta A · "BOX INDUSTRIAL": maqueta de alta fidelidad con datos reales del catálogo y del engine de la demo. */
export default function PropuestaAPage() {
  const arrives = cadeteWhen();
  const settings = demoData().settings;
  const hero = rackItem(HERO_SLUG);
  const rack = RACK_SLUGS.map(rackItem);
  const ficha = rackItem(FICHA_SLUG);
  const fichaProduct = getProduct(FICHA_SLUG);
  const panel = panelToday();
  const ticker = [
    { key: "demo", label: "Demo", text: "No se cobra nada" },
    { key: "cadete", label: "Cadete MdP", text: `Llega ${arrives.text}` },
    { key: "transfer", label: `−${settings.transferDiscountPct} %`, text: "Con transferencia" },
    { key: "envio", label: "Envío gratis", text: `Desde ${formatARS(settings.freeShippingFrom)}` },
  ];
  return (
    <main id="contenido">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-baseline justify-between gap-2 px-4 pt-6 sm:px-8">
        <h1 className={`${s.display} text-2xl text-(--bx-volt)`}>Propuesta A · Box industrial</h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--bx-dim)">Maqueta · datos de la demo</p>
      </div>

      <section aria-labelledby="a-b1">
        <BlockLabel n={1} title="Inicio" id="a-b1" />
        <Ticker items={ticker} />
        <BoxHeader />
        <Hero item={hero} arrives={arrives.text} />
      </section>

      <section aria-labelledby="a-b2" id="a-cards">
        <BlockLabel n={2} title="Tarjetas de producto" id="a-b2" />
        <div className="mx-auto max-w-[1360px] px-4 pb-6 pt-6 sm:px-8">
          <h3 className={`${s.display} mb-5 text-5xl`}>El rack <span className="text-(--bx-dim)">· más elegidos</span></h3>
          <div className="grid grid-cols-2 gap-px border border-(--bx-steel) bg-(--bx-steel) lg:grid-cols-4">
            {rack.map((item, i) => (
              <SlotIn key={item.slug} index={i} className="min-w-0">
                <RackCard item={item} slot={`A-${String(i + 1).padStart(2, "0")}`} />
              </SlotIn>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="a-b3" id="a-ficha">
        <BlockLabel n={3} title="Ficha de producto" id="a-b3" />
        <Ficha item={ficha} category={getCategory(fichaProduct?.categorySlug ?? "")?.name ?? ""} nutrition={fichaProduct?.nutrition} arrives={arrives.text} />
      </section>

      <section aria-labelledby="a-b4">
        <BlockLabel n={4} title="Panel · Hoy en tu tienda" id="a-b4" />
        <PanelToday data={panel} />
      </section>
    </main>
  );
}
