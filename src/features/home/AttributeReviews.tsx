import Link from "next/link";
import { Quote } from "lucide-react";
import { productHref } from "@/demo/engine/catalog";
import { homeReviews, scoreText } from "@/demo/engine/home";
import { REVIEW_ATTRIBUTES } from "@/demo/fixtures/reviews";
import { plural } from "@/lib/plural";
import { HomeBlockTitle } from "./HomeBlockTitle";

/**
 * Reseñas por atributo (sabor, mezcla y efecto), como las fichas de un laboratorio: una barra por atributo con su nota
 * y una frase de un comprador. Son reseñas de MUESTRA (fixtures) y se dice en el bloque.
 */
export function AttributeReviews({ n }: { n: number }) {
  const list = homeReviews(3);
  if (!list.length) return null;
  return (
    <section aria-labelledby="resenas-title">
      <HomeBlockTitle id="resenas-title" n={n} kicker="Reseñas de muestra" title="Lo que dice el box" />
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
        {list.map((r) => (
          <li key={r.productSlug} className="lab-grid flex flex-col gap-4 border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <Link href={productHref(r.product.slug)} className="font-display text-xl leading-none hover:underline">{r.product.name}</Link>
              <span className="shrink-0 font-mono text-[11px] text-muted">{plural(r.count, "reseña", "reseñas")}</span>
            </div>
            <dl className="flex flex-col gap-2">
              {REVIEW_ATTRIBUTES.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2rem] items-center gap-2">
                  <dt className="eyebrow text-muted">{label}</dt>
                  <dd aria-hidden="true" className="h-2.5 bg-line"><span className="block h-full bg-volt-ink" style={{ width: `${(r.scores[key] / 5) * 100}%` }} /></dd>
                  <dd className="text-right font-mono text-sm font-bold tabular-nums"><span className="sr-only">{label}: </span>{scoreText(r.scores[key])}<span className="sr-only"> de 5</span></dd>
                </div>
              ))}
            </dl>
            <blockquote className="mt-auto border-t border-line pt-3 text-sm">
              <Quote size={16} aria-hidden="true" className="mb-1 text-volt-ink" />
              <p>{r.quote.text}</p>
              <footer className="mt-2 font-mono text-[11px] text-muted">{r.quote.author}{r.quote.flavor ? ` · ${r.quote.flavor}` : ""}</footer>
            </blockquote>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Reseñas ficticias de muestra: en la tienda real son de compradores verificados</p>
    </section>
  );
}
