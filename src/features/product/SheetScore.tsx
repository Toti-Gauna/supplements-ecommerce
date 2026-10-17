import type { CSSProperties } from "react";
import { Led, LedPrice } from "@/components/atoms/Led";
import type { Readout } from "@/demo/engine/sheet-readouts";
import { cn } from "@/lib/cn";

/** En el celular la celda es angosta: el rótulo largo se abrevia (la lectura completa la tiene el marcador). */
const SHORT: Partial<Record<Readout["key"], string>> = { "per-serving": "Por serv." };

/**
 * La tira chica del marcador, debajo del precio total (L1: primero el total, abajo cuánto rinde): precio por servicio,
 * el activo por servicio, servicios y "te dura N días" con los servicios por día de la calculadora. Cambia con un flip
 * al elegir otra presentación. Sin lecturas (equipamiento) no se dibuja.
 */
export function SheetScore({ readouts, flipKey }: { readouts: Readout[]; flipKey: string }) {
  if (readouts.length === 0) return null;
  const led = "h-[15px] max-w-full sm:h-5";
  // Los datos en texto (medidas, talles) no entran en cuatro columnas de celular: van de a dos.
  const text = readouts.some((r) => r.text);
  return (
    <dl aria-label={text ? "Datos de ficha" : "Cuánto rinde"} style={{ "--cols": readouts.length } as CSSProperties}
      className={cn("grid gap-px overflow-hidden rounded-sm border border-line bg-line", text ? "grid-cols-2 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]" : "grid-cols-[repeat(var(--cols),minmax(0,1fr))]")}>
      {readouts.map((r) => (
        <div key={r.key} className="flex min-w-0 flex-col gap-1.5 bg-surface px-2 py-2 sm:px-3 sm:py-2.5">
          <dt className="truncate font-lab text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted sm:text-[10px] sm:tracking-[0.12em]">
            {SHORT[r.key] ? <><span className="sm:hidden">{SHORT[r.key]}</span><span className="max-sm:hidden">{r.label}</span></> : r.label}
          </dt>
          <dd className="flex min-w-0 items-end gap-1">
            {r.text ? <span className="truncate font-lab text-[13px] font-bold leading-none sm:text-sm">{r.value}</span>
              : r.amount !== undefined
              ? <LedPrice key={flipKey} amount={r.amount} suffix=" por servicio" tone="chalk" motion="flip" className={led} signClassName="text-[13px] sm:text-base" />
              : <Led key={`${flipKey}-${r.value}`} value={r.value} label={r.reading} tone={r.key === "days" ? "volt" : "chalk"} motion="flip" className={led} />}
            {r.unit && <span aria-hidden="true" className="font-lab text-[10.5px] font-bold leading-none text-muted sm:text-xs">{r.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
