import type { PackLineView, PackQuote } from "@/demo/engine/packs";
import { formatARS } from "@/lib/money";

function Lines({ title, lines, note }: { title: string; lines: PackLineView[]; note: string }) {
  if (!lines.length) return null;
  return (
    <div>
      <h3 className="text-sm font-extrabold">{title}</h3>
      <p className="mb-1 text-xs text-muted">{note}</p>
      <ul className="flex flex-col gap-1 text-sm">
        {lines.map((l) => (
          <li key={l.item.productSlug} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0"><span className="font-bold tabular-nums">{l.item.qty} ×</span> {l.product.name} <span className="text-muted">· {l.variant.label}</span></span>
            <span className="shrink-0 tabular-nums text-muted">{formatARS(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Vista previa en vivo con los precios que va a ver quien compre el pack (la misma cuenta que usa la tienda). */
export function PackPreview({ quote }: { quote: PackQuote }) {
  const { pack, lines } = quote;
  const monthly = lines.filter((l) => l.recurring);
  const first = lines.filter((l) => !l.recurring);
  return (
    <section aria-label="Vista previa" className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-extrabold">Vista previa</h2>
      {lines.length === 0 ? <p className="rounded-sm bg-bg p-4 text-sm text-muted">Agregá productos para ver los precios.</p> : (
        <>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-sm bg-bg p-3">
              <dt className="text-xs font-bold text-muted">Primera entrega</dt>
              <dd className="text-2xl font-extrabold tabular-nums">{formatARS(quote.price)}</dd>
              <dd className="text-xs text-muted">Suelto {formatARS(quote.subtotal)}{quote.discount > 0 ? <> · ahorrás {formatARS(quote.discount)} ({pack.discountPct} %)</> : " · sin descuento"}</dd>
            </div>
            <div className="rounded-sm bg-bg p-3">
              <dt className="text-xs font-bold text-muted">Por mes</dt>
              <dd className="text-2xl font-extrabold tabular-nums">{formatARS(quote.monthlyPrice)}</dd>
              <dd className="text-xs text-muted">Suelto {formatARS(quote.monthlySubtotal)}{quote.monthlySaving > 0 ? <> · ahorrás {formatARS(quote.monthlySaving)} ({pack.discountPct + pack.monthlyPct} %)</> : " · sin descuento"}</dd>
            </div>
          </dl>
          {quote.lastsDays !== null && <p className="text-sm font-bold">Te dura {quote.lastsDays} días <span className="font-normal text-muted">(un servicio por día, lo que se termina primero)</span></p>}
          <Lines title="Se repite cada mes" note="Suplementos, con el descuento del pack y el extra mensual." lines={monthly} />
          <Lines title="Solo la primera entrega" note="Equipamiento: no se consume, no se repite." lines={first} />
        </>
      )}
      {quote.missing.length > 0 && <p role="status" className="rounded-sm bg-warning-soft px-3 py-2 text-sm font-bold text-warning">No se puede comprar ahora: {quote.missing.join(", ")} sin stock o pausado.</p>}
    </section>
  );
}
