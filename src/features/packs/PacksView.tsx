"use client";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { IllustrativeNote } from "@/components/molecules/ProductCard";
import { PageHeader } from "@/components/templates/PageHeader";
import { useDemoData } from "@/stores/admin";
import { PackCard } from "./PackCard";
import { PackDetail } from "./PackDetail";

/**
 * /packs/: sin `?pack=` la grilla de packs activos; con `?pack=<id>` el detalle. Un pack inexistente o pausado desde el
 * panel dice que no está disponible (va dentro de `<Suspense>`: lee la URL).
 */
export function PacksView() {
  const id = useSearchParams().get("pack");
  const packs = useDemoData((d) => d.packs);
  const active = (packs ?? []).filter((p) => p.active !== false);
  if (id) {
    const pack = active.find((p) => p.id === id);
    return pack ? <PackDetail key={pack.id} pack={pack} /> : (
      <>
        <PageHeader title="Packs" />
        <EmptyState title="Ese pack no está disponible" action={<ButtonLink href="/packs/">Ver todos los packs</ButtonLink>}>
          Puede que el local lo haya pausado o que el link esté mal. Mirá los que hay ahora.
        </EmptyState>
      </>
    );
  }
  return (
    <>
      <PageHeader title="Packs">Todo lo que necesitás para tu objetivo o tu deporte, junto y con descuento. Llevalo una vez o recibilo todos los meses.</PageHeader>
      {active.length === 0 ? (
        <EmptyState title="Todavía no hay packs" action={<ButtonLink href="/categorias/">Ver la tienda</ButtonLink>}>Armá tu pedido producto por producto mientras tanto.</EmptyState>
      ) : (
        <>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((p) => <li key={p.id} className="animate-fade-up"><PackCard pack={p} /></li>)}
          </ul>
          <IllustrativeNote className="mt-4" />
        </>
      )}
    </>
  );
}
