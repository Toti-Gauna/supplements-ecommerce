import { ScanBarcode } from "lucide-react";
import type { CheckedLot } from "@/demo/engine/tracking";
import { cn } from "@/lib/cn";

/**
 * Etiqueta de lote impresa (laboratorio): LOTE · código · VTO. Es el lote que el panel confirmó en el control de lote;
 * antes de ese control se dice que se asigna al armar (FEFO: sale primero el que vence antes).
 */
export function LotTag({ lot, className }: { lot: CheckedLot | null; className?: string }) {
  if (!lot) {
    return (
      <p className={cn("mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted", className)}>
        <ScanBarcode size={13} aria-hidden="true" /> Lote: se controla al armar tu pedido
      </p>
    );
  }
  if (!lot.code) return <p className={cn("mt-1 font-mono text-[11px] text-muted", className)}>Lote controlado en el local</p>;
  return (
    <p className={cn("mt-1.5 inline-flex max-w-full flex-wrap items-stretch border border-ink font-mono text-[11px]", className)}>
      <span className="bg-ink px-1.5 py-0.5 font-bold tracking-[0.1em] text-bg">LOTE<span className="sr-only"> </span></span>
      <span className="px-1.5 py-0.5 font-semibold">{lot.code}<span className="sr-only">, vence </span></span>
      {lot.expires && <span className="border-l border-ink px-1.5 py-0.5"><span aria-hidden="true">VTO </span>{lot.expires}</span>}
    </p>
  );
}
