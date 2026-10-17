"use client";
import { BellRing } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { IllustrativeNote } from "@/components/molecules/ProductCard";
import { plural } from "@/lib/plural";
import { useHydrated } from "@/stores/hydration";
import { RackBay } from "./RackBay";
import { RackTotals } from "./RackTotals";
import { useMyRack } from "./useMyRack";

/**
 * Mi rack (R2c, antes "Favoritos"): lo guardado con el corazón como el estante propio. A la izquierda los potes en su
 * lugar, cada uno con su aviso simulado; a la derecha (arriba en el celular) el marcador con el total y las salidas.
 */
export function RackView() {
  const hydrated = useHydrated();
  const rack = useMyRack();
  if (!hydrated) return <ListSkeleton rows={3} label="Cargando tu rack" />;
  const { items } = rack.summary;
  if (!items.length) {
    return (
      <EmptyState title="Esta barra está sin discos"
        action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href="/categorias/">Explorar la tienda</ButtonLink><ButtonLink href="/crear/" variant="secondary">Armá tu stack</ButtonLink></div>}>
        Tocá el corazón en cualquier producto y queda acá, en tu rack: con el total para llevarte todo y el aviso si baja de precio o vuelve el stock.
      </EmptyState>
    );
  }
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="lg:sticky lg:top-24 lg:order-2">
        <RackTotals summary={rack.summary} stack={rack.stack} stackHref={rack.stackHref} onAddAll={rack.addAll} />
      </div>
      <section aria-labelledby="rack-shelf-title" className="min-w-0 lg:order-1">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-ink pb-2">
          <h2 id="rack-shelf-title" className="font-display text-2xl sm:text-3xl">Tu estante · {String(items.length).padStart(2, "0")}</h2>
          <p role="status" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            <BellRing size={14} aria-hidden="true" className={rack.triggered ? "text-volt-ink" : undefined} />
            {rack.watching ? `${plural(rack.watching, "aviso activo", "avisos activos")}${rack.triggered ? ` · ${plural(rack.triggered, "saltó", "saltaron")}` : ""}` : "Sin avisos"}
          </p>
        </div>
        <ul aria-label="Productos de Mi rack" className="grid grid-cols-[minmax(0,1fr)] gap-3">
          {items.map((item, i) => (
            <li key={item.product.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <RackBay item={item} index={i} status={rack.statusOf(item.product.slug)}
                onWatch={(again) => rack.watch(item.product, again)} onUnwatch={() => rack.unwatch(item.product.slug)} onRemove={() => rack.removeFromRack(item.product)} />
            </li>
          ))}
        </ul>
        <p role="note" className="mt-4 border-l-2 border-warning bg-warning-soft px-3 py-2 text-sm text-ink">
          <strong>Avisos simulados.</strong> En esta demo no se manda nada: el aviso salta acá cuando el dueño baja el precio en el panel o vuelve el stock. “Te dura” es con 1 servicio por día.
        </p>
        <IllustrativeNote className="mt-3" />
      </section>
    </div>
  );
}
