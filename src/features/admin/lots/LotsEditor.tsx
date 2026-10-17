"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { lotState } from "@/demo/admin/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { daysToExpiry, fefo } from "@/demo/engine/lots";
import type { Lot } from "@/demo/types";
import { NumberField } from "../NumberField";
import { LotBadge } from "./LotBadge";

interface Props {
  lots: Lot[];
  onChange: (lots: Lot[]) => void;
  /** Prefijo único para los ids de los campos. */
  idPrefix: string;
  /** Nombre de la variante, para los nombres accesibles. */
  name: string;
}

/** Un año después del mes de la demo: el vencimiento típico de un lote recién comprado. */
const nextYear = () => `${Number(DEMO_TODAY.slice(0, 4)) + 1}${DEMO_TODAY.slice(4, 7)}`;

/**
 * Lotes de una variante (Fase 6): código, vencimiento (mes) y unidades. El stock es la suma; vende primero el lote que
 * vence primero. Un lote nuevo es mercadería que entró: arranca con vencimiento a un año.
 */
export function LotsEditor({ lots, onChange, idPrefix, name }: Props) {
  const patch = (i: number, p: Partial<Lot>) => onChange(lots.map((l, k) => (k === i ? { ...l, ...p } : l)));
  const first = fefo(lots).find((l) => l.units > 0);
  return (
    <fieldset className="flex flex-col gap-2 rounded-sm bg-bg p-3">
      <legend className="sr-only">Lotes de {name}</legend>
      <p className="text-sm font-bold">Lotes <span className="font-normal text-muted">· el stock es la suma; sale primero el que vence antes</span></p>
      {lots.map((l, i) => {
        const id = `${idPrefix}-lot-${i}`;
        const valid = /^\d{4}-\d{2}$/.test(l.expires);
        return (
          <div key={i} className="grid grid-cols-2 items-end gap-2 rounded-sm border border-line bg-surface p-2.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]">
            <label className="col-span-2 flex flex-col gap-1 text-sm font-bold sm:col-span-1" htmlFor={`${id}-code`}>Código
              <Input id={`${id}-code`} value={l.code} onChange={(e) => patch(i, { code: e.target.value.toUpperCase() })} placeholder="VL-2610-W" className="font-lab" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold" htmlFor={`${id}-exp`}>Vence
              <Input id={`${id}-exp`} type="month" value={l.expires} onChange={(e) => patch(i, { expires: e.target.value })} aria-invalid={!valid} />
            </label>
            <NumberField id={`${id}-units`} label="Unidades" value={l.units} onChange={(n) => patch(i, { units: n })} />
            <Button variant="danger" size="sm" className="col-span-2 justify-self-end sm:col-span-1" aria-label={`Quitar el lote ${l.code || i + 1} de ${name}`} onClick={() => onChange(lots.filter((_, k) => k !== i))}>
              <Trash2 size={16} aria-hidden="true" /><span className="sm:sr-only">Quitar</span>
            </Button>
            {valid && l.units > 0 && (
              <p className="col-span-full flex flex-wrap items-center gap-2 text-xs text-muted">
                {l === first && <span className="font-bold text-ink">Sale primero</span>}
                {lotState(l, DEMO_TODAY) !== "ok" && <LotBadge row={{ lot: l, days: daysToExpiry(l.expires, DEMO_TODAY), state: lotState(l, DEMO_TODAY) }} />}
              </p>
            )}
          </div>
        );
      })}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => onChange([...lots, { code: "", expires: nextYear(), units: 0, receivedOn: DEMO_TODAY }])}>
        <Plus size={16} aria-hidden="true" /> Agregar lote
      </Button>
    </fieldset>
  );
}
