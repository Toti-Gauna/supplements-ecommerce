"use client";
import { Bell, BellRing } from "lucide-react";
import { rackAlertText, type RackAlertStatus } from "@/demo/engine/rack-alerts";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

const TOGGLE = "inline-flex min-h-10 items-center gap-2 text-left border px-3 font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-colors";
const LINK = "min-h-10 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4";

/**
 * "Avisame si baja o si vuelve" de un pote del rack (simulado). Apagado: el botón. Prendido: el estado del aviso con
 * los datos de hoy. Si saltó (el dueño bajó el precio en el panel o volvió el stock), la placa se enciende.
 */
export function RackAlertControl({ name, status, onWatch, onUnwatch }: {
  name: string;
  status: RackAlertStatus | null;
  onWatch: (again: boolean) => void;
  onUnwatch: () => void;
}) {
  const on = status !== null;
  const fired = status?.kind === "triggered";
  return (
    <div className="flex flex-col gap-2">
      <button type="button" aria-pressed={on} aria-label={`Avisame si baja o si vuelve: ${name}`} onClick={on ? onUnwatch : () => onWatch(false)}
        className={cn(TOGGLE, "self-start", on ? "border-volt-ink/60 bg-accent text-ink" : "border-line text-muted hover:border-ink/40 hover:text-ink")}>
        {on ? <BellRing size={15} aria-hidden="true" className="text-volt-ink" /> : <Bell size={15} aria-hidden="true" />}
        Avisame si baja o si vuelve
      </button>
      {status && (
        <p data-rack-alert={status.kind} className={cn("border-l-2 px-2.5 py-1.5 font-mono text-[11.5px] leading-snug",
          fired ? "border-volt-ink bg-accent text-ink" : "border-line text-muted")}>
          <span className={cn("font-bold uppercase tracking-[0.08em]", fired ? "text-volt-ink" : "text-ink")}>{fired ? "¡Saltó tu aviso! " : "Aviso activo · "}</span>
          {rackAlertText(status, formatARS)}
          <span className="text-muted"> (simulado)</span>
        </p>
      )}
      {fired && <button type="button" aria-label={`Seguir avisando: ${name}`} onClick={() => onWatch(true)} className={cn(LINK, "self-start")}>Seguir avisando</button>}
    </div>
  );
}
