import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xl", className)} />;
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Cargando productos" className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square w-full rounded-[var(--radius-card)]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Ficha de producto: galería + título, precio y tarjeta de opciones. */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Cargando producto" className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-square w-full rounded-[2rem]" />
        <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-20 rounded-2xl" />)}</div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-2 h-10 w-44" />
        <Skeleton className="mt-2 h-72 w-full rounded-[1.75rem]" />
      </div>
    </div>
  );
}

/** Lista de tarjetas (pedidos, cupones, misiones…). */
export function ListSkeleton({ rows = 3, label = "Cargando" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Bloque destacado oscuro (confirmación, seguimiento) + líneas. */
export function HeroSkeleton({ label = "Cargando" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[2.5rem] bg-night p-6 sm:p-10">
        <div className="skeleton h-14 w-14 rounded-full opacity-20" />
        <div className="skeleton h-10 w-3/4 rounded-xl opacity-20" />
        <div className="skeleton h-4 w-1/2 rounded-xl opacity-20" />
      </div>
      <ListSkeleton rows={2} label={label} />
    </div>
  );
}

/** Página genérica de la tienda mientras carga la ruta: título + grilla. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Cargando página" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-12 w-2/3 max-w-lg" /></div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
