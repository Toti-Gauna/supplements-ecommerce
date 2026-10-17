import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { firstOutLot, formatExpiry } from "@/demo/engine/lots";
import type { Product, Variant } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Una celda de la etiqueta: rótulo chico arriba y el dato en mono. */
export function LabelCell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5 border-ink/70 px-2.5 py-1.5", className)}>
      <dt className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="truncate text-[13px] font-bold">{children}</dd>
    </div>
  );
}

/**
 * Etiqueta de laboratorio del envase que te llevás: lote que sale primero (FEFO), vencimiento y RNPA, con el aviso de
 * cómo sale la mercadería y el acceso a "Verificá tu lote".
 */
export function LotLabel({ product, variant }: { product: Product; variant: Variant }) {
  const lot = firstOutLot(variant) ?? product.lot;
  if (!lot && !product.rnpa) return null;
  return (
    <div className="font-lab text-ink">
      <div className="flex overflow-hidden rounded-sm border border-ink/70 bg-surface">
        <span aria-hidden="true" className="grid place-items-center bg-ink px-2 text-[11px] font-bold tracking-[0.14em] text-bg [writing-mode:vertical-rl] rotate-180">LOTE</span>
        <dl aria-label="Lote del envase" className="grid min-w-0 flex-1 grid-cols-2">
          {lot && <LabelCell label="Lote · vence">{lot.code} · {formatExpiry(lot.expires)}</LabelCell>}
          {product.rnpa && <LabelCell label="RNPA (muestra)" className="border-l">{product.rnpa}</LabelCell>}
        </dl>
      </div>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
        <ShieldCheck size={14} aria-hidden="true" className="text-success" />
        <span>FEFO: sale primero el que vence antes.</span>
        <a href="#verificar" className="font-bold text-ink underline underline-offset-2">Verificá tu lote</a>
      </p>
    </div>
  );
}
