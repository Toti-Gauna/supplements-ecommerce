import type { ReactNode } from "react";
import { Led, LedPrice } from "@/components/atoms/Led";
import type { SheetScore as Score } from "@/demo/engine/sheet";
import { formatARS } from "@/lib/money";

function Cell({ label, children, note, signal = false }: { label: string; children: ReactNode; note?: ReactNode; signal?: boolean }) {
  return (
    <div className="plate relative flex min-w-0 flex-col gap-1.5 p-3 sm:p-3.5">
      {signal && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-volt" />}
      <dt className="font-lab text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="flex min-h-8 items-end gap-1.5">{children}</dd>
      {note && <dd className="font-lab text-[11px] text-muted">{note}</dd>}
    </div>
  );
}

/**
 * Marcador de la hoja técnica, arriba del pliegue en el celular: precio por servicio, el activo por servicio
 * (proteína, creatina, cafeína…), servicios y "te dura N días" (con los servicios por día de la calculadora). Cambia
 * con un flip de marcador al elegir otra presentación.
 */
export function SheetScore({ score, perDay, flipKey }: { score: Score; perDay: number; flipKey: string }) {
  const { perServing, servings, active, days, price } = score;
  const led = "h-7 sm:h-8";
  return (
    <dl aria-label="Datos por servicio" className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line">
      <Cell label={perServing === null ? "Precio" : "Por servicio"} signal>
        <LedPrice key={flipKey} amount={perServing ?? price} suffix={perServing === null ? "" : " por servicio"} motion="flip" className={led} signClassName="text-2xl" />
      </Cell>
      {active ? (
        <Cell label={`${active.label} / serv.`}>
          <Led key={flipKey} value={active.amount} label={`${active.amount} ${active.unit} de ${active.label.toLowerCase()} por servicio`} tone="chalk" motion="flip" className={led} />
          <span className="pb-0.5 font-lab text-sm font-bold text-muted" aria-hidden="true">{active.unit}</span>
        </Cell>
      ) : (
        <Cell label="Envase"><span className="font-lab text-lg font-bold">{formatARS(price)}</span></Cell>
      )}
      <Cell label="Servicios">
        {servings ? <Led key={flipKey} value={String(servings)} label={`${servings} servicios`} tone="chalk" motion="flip" className={led} /> : <span className="font-lab text-lg font-bold">1</span>}
      </Cell>
      <Cell label="Te dura" note={days ? `con ${perDay} por día` : undefined}>
        {days ? (
          <>
            <Led key={`${flipKey}-${perDay}`} value={String(days)} label={`Te dura ${days} días con ${perDay} servicio${perDay === 1 ? "" : "s"} por día`} motion="flip" className={led} />
            <span aria-hidden="true" className="pb-0.5 font-lab text-sm font-bold text-muted">días</span>
          </>
        ) : <span className="font-lab text-sm font-bold text-muted">Un uso</span>}
      </Cell>
    </dl>
  );
}
