import { Quote } from "lucide-react";
import { LoadBar } from "@/components/molecules/LoadBar";
import { REVIEW_ATTRIBUTES, type ProductReviews } from "@/demo/fixtures/reviews";

const score = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Reseñas por atributo (sabor, mezcla y efecto), como lecturas de laboratorio, y una cita corta. Datos de MUESTRA. */
export function AttributeScores({ reviews: r }: { reviews: ProductReviews }) {
  return (
    <section aria-labelledby="resenas-t" className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <p className="eyebrow text-volt-ink">{r.count} reseñas de muestra</p>
      <h2 id="resenas-t" className="font-display mt-1 text-2xl">Lo que dicen del sabor, la mezcla y el efecto</h2>
      <dl className="mt-4 flex flex-col gap-3">
        {REVIEW_ATTRIBUTES.map((a) => (
          <div key={a.key} className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-3">
            <dt className="font-lab text-xs font-bold uppercase tracking-[0.1em]">{a.label}</dt>
            <dd><LoadBar pct={(r.scores[a.key] / 5) * 100} label={`${a.label}: ${score(r.scores[a.key])} de 5`}>{score(r.scores[a.key])}</LoadBar></dd>
          </div>
        ))}
      </dl>
      <blockquote className="mt-5 flex gap-3 border-t border-line pt-4 text-sm">
        <Quote size={18} aria-hidden="true" className="shrink-0 text-volt-ink" />
        <p>“{r.quote.text}” <span className="text-muted">— {r.quote.author}{r.quote.flavor ? `, ${r.quote.flavor}` : ""}</span></p>
      </blockquote>
    </section>
  );
}
