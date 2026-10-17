"use client";
import { Plus } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { LedPrice } from "@/components/atoms/Led";
import { IconBarbell } from "@/components/illustrations/GymIcons";
import type { MyRackSummary, RackStack } from "@/demo/engine/my-rack";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";

const ROW = "flex items-baseline justify-between gap-3 border-b border-white/10 py-1.5 font-mono text-[12px]";

/**
 * Marcador de Mi rack (banda noche en los dos modos): el total de llevarse todo hoy primero y grande, el descuento
 * stack que tendría en el carrito y las dos salidas: agregar todo o llevarlo al armador con cada pote en su lugar.
 */
export function RackTotals({ summary, stack, stackHref, onAddAll }: { summary: MyRackSummary; stack: RackStack; stackHref: string | null; onAddAll: () => void }) {
  const { buyable, items, subtotal, total } = summary;
  const { discount, missing, pct } = summary.stack;
  const outCount = items.length - buyable.length;
  return (
    <section aria-labelledby="rack-total-title" className="floor led-dark relative overflow-hidden border border-white/10 p-4 text-on-night sm:p-5">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-volt" />
      <h2 id="rack-total-title" className="eyebrow text-night-muted">Total del rack</h2>
      <div className="mt-2" data-rack-total={total}>
        <LedPrice amount={total} motion="flip" className="h-11 max-w-full sm:h-14" signClassName="text-3xl text-volt" />
      </div>
      <p className="mt-1 font-mono text-[11px] text-night-muted">{plural(buyable.length, "producto", "productos")} · una unidad de cada uno</p>
      <div className="mt-4">
        <p className={ROW}><span className="text-night-muted">Subtotal</span><span className="tabular-nums">{formatARS(subtotal)}</span></p>
        {discount > 0
          ? <p className={ROW}><span className="text-volt">Descuento stack −{pct} %</span><span className="tabular-nums text-volt">−{formatARS(discount)}</span></p>
          : <p className={ROW}><span className="text-night-muted">Descuento stack</span><span className="text-right text-night-muted">{buyable.length ? `te falta ${plural(missing, "categoría", "categorías")}` : "—"}</span></p>}
        {outCount > 0 && <p className="pt-2 font-mono text-[11px] text-night-muted">{plural(outCount, "producto agotado no suma", "productos agotados no suman")}: pedí el aviso y te avisamos cuando vuelva.</p>}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Button variant="light" size="lg" onClick={onAddAll} disabled={!buyable.length} className="w-full">
          <Plus size={18} aria-hidden="true" /> Agregar todo al carrito
        </Button>
        {stackHref
          ? <ButtonLink href={stackHref} variant="dark" size="md" className="w-full"><IconBarbell size={18} aria-hidden="true" /> Armar stack con esto</ButtonLink>
          : <Button variant="dark" size="md" disabled className="w-full"><IconBarbell size={18} aria-hidden="true" /> Armar stack con esto</Button>}
        <p className="font-mono text-[11px] leading-relaxed text-night-muted">
          {stack.picks.length
            ? `${plural(stack.picks.length, "pote entra", "potes entran")} en el armador${stack.left.length ? `; ${plural(stack.left.length, "queda", "quedan")} afuera (equipamiento, agotado o un lugar repetido)` : ", cada uno en su lugar"}.`
            : "Para armar un stack guardá proteína, creatina, pre-entreno o un extra con stock."}
        </p>
      </div>
    </section>
  );
}
