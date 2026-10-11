"use client";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/atoms/Skeleton";
import { useHydrated } from "@/stores/hydration";

/** Espera a leer el estado local antes de mostrar datos (evita un parpadeo de los fixtures). */
export function AdminGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div role="status" aria-label="Cargando panel demo" className="flex flex-col gap-3">
        <Skeleton className="h-9 w-56" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  return <div className="animate-fade-in">{children}</div>;
}
