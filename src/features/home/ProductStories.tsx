"use client";
import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { Reveal } from "@/components/motion/Reveal";
import { getProduct, productHref } from "@/demo/engine/catalog";
import { productStories } from "@/demo/fixtures/stories";
import { formatARS } from "@/lib/money";
import { fromPrice } from "@/demo/engine/catalog";

/** "Ciencia simple": notas cortas que explican un producto; cada tarjeta lleva a su ficha. */
export function ProductStories() {
  const stories = productStories.flatMap((s) => { const p = getProduct(s.productSlug); return p && p.active !== false ? [{ s, p }] : []; });
  if (stories.length === 0) return null;
  return (
    <section aria-labelledby="historias">
      <Reveal className="mb-8 max-w-2xl">
        <p className="eyebrow text-volt-ink">Ciencia simple</p>
        <h2 id="historias" className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Lo que tenés que saber, <span className="text-volt-ink">sin vueltas</span></h2>
        <p className="mt-3 text-muted">Notas cortas para elegir mejor. Textos ilustrativos de la demo: no reemplazan la consulta con un profesional.</p>
      </Reveal>
      <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {stories.map(({ s, p }, i) => (
          <Reveal as="li" key={s.id} y={0} delay={i * 0.08} className="w-[80%] shrink-0 snap-start sm:w-auto">
            <Link href={productHref(p.slug)} className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]">
              <div className="relative aspect-[5/4] overflow-hidden bg-accent">
                <ProductArt art={p.art} pack={p.pack} view={p.gallery.includes("detail") ? "detail" : "front"} tint={p.variants[0]?.colorHex} label="" showBadge={false} className="h-full w-full transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105 [&>svg]:h-full" />
                <span className="absolute left-4 top-4 rounded-full bg-volt px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-night">{s.kicker}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <FlaskConical size={20} aria-hidden="true" className="text-volt-ink" />
                <h3 className="font-display mt-2 text-2xl leading-tight">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{s.text}</p>
                <p className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm font-bold">
                  <span>{p.name}<span className="block font-semibold text-muted">desde {formatARS(fromPrice(p))}</span></span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-bg transition-transform group-hover:rotate-45"><ArrowUpRight size={18} aria-hidden="true" /></span>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
