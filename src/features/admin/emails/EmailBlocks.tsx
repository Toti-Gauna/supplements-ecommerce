import { ProductArt } from "@/components/illustrations/ProductArt";
import type { RenderedBlock, RenderedLine } from "@/demo/admin/emails/render";
import { cn } from "@/lib/cn";

/**
 * Bloques con datos del email (pedido, productos, cómo tomarlo, recorrido y recompra) con la estética de VOLTA sobre el
 * fondo blanco de la casilla: rótulo de laboratorio en mono, recorrido como batería que se carga. Colores fijos:
 * el email no cambia con el modo oscuro del panel (todos los textos ≥ 4,5:1 sobre blanco).
 */
const INK = "text-[#23272f]";
const SOFT = "text-[#5b6370]";
const NIGHT = "#0b0d10";
const card = "mx-6 mt-5 rounded-2xl border border-[#e3e6ea]";

/** Rótulo de laboratorio: "LOTE VL-2610-C · VTO 03/2028". */
const LabTag = ({ children }: { children: string }) => (
  <span className="font-lab mt-1 inline-block whitespace-nowrap rounded-md border border-[#c9ced6] px-1.5 py-0.5 text-[10px] font-bold text-[#3b424e]">{children}</span>
);

function LineArt({ line, size = "w-14" }: { line: RenderedLine; size?: string }) {
  return <ProductArt art={line.art} pack={line.pack} tint={line.tint} label={line.name} showBadge={false} className={cn("aspect-square shrink-0 rounded-xl", size)} />;
}

export function OrderCard({ b }: { b: Extract<RenderedBlock, { type: "order-card" }> }) {
  return (
    <div className={cn(card, "bg-[#f6f7f9] p-4 text-sm", INK)}>
      <p className="flex items-baseline justify-between gap-3">
        <span className={cn("font-lab text-[11px] font-bold uppercase tracking-[0.14em]", SOFT)}>Pedido <span className="text-[#0b0d10]">{b.code}</span></span>
        <span className="font-lab font-bold tabular-nums text-[#0b0d10]">{b.total}</span>
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className={SOFT}>Estado</dt><dd className="font-semibold">{b.status}</dd>
        <dt className={SOFT}>Entrega</dt><dd className="font-semibold first-letter:uppercase">{b.deliveryDate}</dd>
        <dt className={SOFT}>Cómo</dt><dd className="font-semibold">{b.fulfillment}</dd>
      </dl>
    </div>
  );
}

export function ProductsList({ b }: { b: Extract<RenderedBlock, { type: "products" }> }) {
  return (
    <ul className={cn(card, "flex flex-col divide-y divide-[#eceef1]")}>
      {b.lines.map((l, i) => (
        <li key={i} className="flex items-center gap-3 p-3 text-sm">
          <LineArt line={l} />
          <span className={cn("min-w-0 flex-1", INK)}>
            <span className="block font-bold text-[#0b0d10]">{l.quantity} × {l.name}</span>
            {l.variant}{l.detail ? ` · ${l.detail}` : ""}
            {l.lot && <><br /><LabTag>{l.lot}</LabTag></>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function UsageList({ b }: { b: Extract<RenderedBlock, { type: "usage" }> }) {
  if (!b.lines.length) return null;
  return (
    <ul className={cn(card, "flex flex-col gap-3 p-4 text-sm", INK)}>
      {b.lines.map((l) => (
        <li key={l.name}>
          <p className="font-bold text-[#0b0d10]">{l.name}{l.dose && <span className="font-lab ml-2 rounded-full bg-[#0b0d10] px-2 py-0.5 text-[10.5px] text-volt">{l.dose}</span>}</p>
          <p className="mt-0.5">{l.text}</p>
        </li>
      ))}
    </ul>
  );
}

const STEP_STATE = { done: "listo", current: "ahora", next: "falta" } as const;

/**
 * Recorrido como batería: una celda por paso, cargadas hasta el estado actual. Con lugar, el nombre de cada paso va
 * debajo de su celda; en un celular, una línea con el paso actual y el que sigue (los nombres no entran).
 */
export function TrackingBattery({ b }: { b: Extract<RenderedBlock, { type: "tracking" }> }) {
  const at = b.steps.findIndex((s) => s.state === "current");
  const next = b.steps[at + 1];
  return (
    <div className="@container mx-6 mt-5 rounded-2xl bg-[#f6f7f9] p-4">
      <ol className="flex gap-1.5 rounded-lg border-2 p-1" style={{ borderColor: NIGHT }}>
        {b.steps.map((s) => (
          <li key={s.label} aria-label={`${s.label}: ${STEP_STATE[s.state]}`} className={cn("h-3.5 flex-1 rounded-[3px]", s.state === "done" ? "bg-[#0b0d10]" : s.state === "current" ? "bg-volt ring-1 ring-[#0b0d10]" : "bg-[#e3e6ea]")} />
        ))}
      </ol>
      <div aria-hidden="true" className="mt-2 hidden gap-1.5 @min-[28rem]:flex">
        {b.steps.map((s) => <span key={s.label} className={cn("min-w-0 flex-1 text-center text-[10.5px] leading-tight", s.state === "current" ? "font-bold text-[#0b0d10]" : SOFT)}>{s.label}</span>)}
      </div>
      {at >= 0 && (
        <p aria-hidden="true" className={cn("mt-2 text-[12.5px] @min-[28rem]:hidden", INK)}>
          Ahora: <strong className="text-[#0b0d10]">{b.steps[at]!.label}</strong>{next && <span className={SOFT}> · después: {next.label}</span>}
        </p>
      )}
    </div>
  );
}

/** Producto para reponer: el envase, cuándo se termina y la batería casi vacía. */
export function RefillCard({ b }: { b: Extract<RenderedBlock, { type: "refill" }> }) {
  return (
    <div className={cn(card, "flex items-center gap-4 bg-[#f6f7f9] p-4 text-sm", INK)}>
      <LineArt line={b.line} size="w-20" />
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-[#0b0d10]">{b.line.name}</span>
        {b.line.variant}{b.line.detail ? ` · ${b.line.detail}` : ""}
        <span className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="flex h-3 w-16 gap-0.5 rounded border border-[#0b0d10] p-0.5">
            {Array.from({ length: 6 }, (_, i) => <span key={i} className={cn("flex-1 rounded-[1px]", i === 0 ? "bg-[#d4380d]" : "bg-transparent")} />)}
          </span>
          <span className="font-semibold first-letter:uppercase">Se termina cerca del {b.date}</span>
        </span>
      </span>
    </div>
  );
}

/** Separador con la línea de pulso de la marca. */
export function PulseDivider() {
  return (
    <svg viewBox="0 0 540 24" aria-hidden="true" className="mx-6 mt-6 block h-5 w-[calc(100%-3rem)]" preserveAspectRatio="none">
      <path d="M0 12h220l10-9 12 18 10-14 8 5h280" fill="none" stroke="#c9ced6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
