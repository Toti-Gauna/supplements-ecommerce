"use client";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { ownerSpot, type OwnerSpotId, type SpotContext } from "@/demo/admin/owner-mode";
import { cn } from "@/lib/cn";
import { useOwnerMode } from "@/stores/ownerMode";

/**
 * Punto editable del modo dueño (R4c): con el modo apagado no dibuja nada (el comprador normal nunca lo ve); prendido,
 * una placa sobre lo que se edita que lleva a la pantalla exacta del panel. Placa oscura con texto voltio y borde, así
 * se lee igual sobre el fondo claro, el oscuro y el pie.
 */
export function OwnerSpot({ id, ctx, className }: { id: OwnerSpotId; ctx?: SpotContext; className?: string }) {
  const on = useOwnerMode((s) => s.on);
  if (!on) return null;
  const spot = ownerSpot(id, ctx);
  return (
    <div data-owner-spot={id} className={cn("relative z-10 flex min-w-0 items-center gap-2 py-2", className)}>
      <span aria-hidden="true" className="h-0 min-w-4 flex-1 border-t-2 border-dashed border-volt-ink/60" />
      <Link href={spot.href} aria-label={`Editar en el panel: ${spot.label} (${spot.where})`} title={spot.where}
        className="inline-flex min-h-10 min-w-0 max-w-full items-center gap-2 rounded-xs bg-night px-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-volt ring-1 ring-volt transition-shadow hover:ring-2 motion-reduce:transition-none">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-volt" />
        <span className="min-w-0 truncate">{spot.label}</span>
        <PencilLine size={14} aria-hidden="true" className="shrink-0" />
      </Link>
    </div>
  );
}
