"use client";
import { CalendarClock, ShoppingBag } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { LedPrice } from "@/components/atoms/Led";
import type { PackQuote } from "@/demo/engine/packs";
import { DELIVERY_DAYS } from "@/demo/engine/subscriptions";
import { formatARS } from "@/lib/money";
import { lastsText } from "./packRack";

export const DEFAULT_DELIVERY_DAY = 10;

/**
 * Compra del pack: primero el precio de la primera entrega, grande, con el ahorro chico; después las dos formas de llevarlo,
 * una sola vez o todos los meses (pide el día de entrega). La suscripción es simulada: no se cobra ni se debita nada.
 */
export function PackBuyPanel({ quote, onBuy }: { quote: PackQuote; onBuy: (monthlyDay?: number) => void }) {
  const dayId = useId();
  const [day, setDay] = useState(DEFAULT_DELIVERY_DAY);
  const { pack, available } = quote;
  const lasts = lastsText(quote.lastsDays);
  const repeating = quote.lines.filter((l) => l.recurring).map((l) => l.product.name);
  return (
    <section aria-label="Comprar el pack" className="flex flex-col gap-5 border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div>
        <p className="eyebrow text-muted">Precio del pack · primera entrega</p>
        <div className="mt-2"><LedPrice key={quote.price} amount={quote.price} motion="flip" className="h-11 max-w-full sm:h-14" signClassName="text-3xl sm:text-4xl" /></div>
        {quote.discount > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted">
            <span className="sr-only">Antes</span><s>{formatARS(quote.subtotal)}</s>
            <Badge tone="success">{pack.discountPct} % OFF</Badge>
            <span>Ahorrás {formatARS(quote.discount)}</span>
          </p>
        )}
        {lasts && <p className="mt-2 text-sm text-muted">Lo que se repite cada mes {lasts}.</p>}
      </div>
      {!available && (
        <p role="status" className="bg-warning-soft p-3 text-sm font-bold text-warning">Por ahora no podés comprar este pack: falta stock de {quote.missing.join(", ")}.</p>
      )}
      <Button size="lg" disabled={!available} onClick={() => onBuy()} className="w-full"><ShoppingBag size={18} aria-hidden="true" />Comprar el pack</Button>
      <div className="edge-volt flex flex-col gap-4 p-4 sm:p-5">
        <div>
          <p className="eyebrow flex items-center gap-2 text-volt-ink"><CalendarClock size={14} aria-hidden="true" />Todos los meses</p>
          <p className="font-display mt-1 text-2xl leading-tight">Cada mes: {formatARS(quote.monthlyPrice)} <span className="font-mono text-sm font-bold text-success">(ahorrás {formatARS(quote.monthlySaving)})</span></p>
          <p className="mt-1.5 text-sm text-muted">Se repite: {repeating.join(", ")}. Lo demás llega solo en la primera entrega. Con el extra por suscribirte, cada entrega tiene {pack.discountPct + pack.monthlyPct} % off.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={dayId} className="font-mono text-[12px] font-bold uppercase tracking-[0.08em]">Día del mes en que lo querés recibir</label>
          <Select id={dayId} value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DELIVERY_DAYS.map((d) => <option key={d} value={d}>Día {d}</option>)}
          </Select>
        </div>
        <Button size="lg" variant="dark" disabled={!available} onClick={() => onBuy(day)} className="w-full">Quiero este pack todos los meses</Button>
        <p className="text-xs text-muted">Demo: no se cobra ni se debita nada. Pausás, salteás o cancelás cuando quieras desde Mi cuenta.</p>
      </div>
    </section>
  );
}
