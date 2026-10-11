import { Skeleton } from "@/components/atoms/Skeleton";

/** Esqueleto mientras carga cada sección del panel. */
export default function AdminLoading() {
  return (
    <div role="status" aria-label="Cargando sección del panel" className="flex flex-col gap-4">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}
