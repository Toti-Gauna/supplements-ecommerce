"use client";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { activeSubscriptions } from "@/demo/admin/pack-rows";
import { useAdmin } from "@/stores/admin";
import { useSubscriptions } from "@/stores/subscriptions";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { NEW_PACK } from "./packColumns";
import { PacksTable } from "./PacksTable";
import { SubscriptionsTab } from "./SubscriptionsTab";

type Mode = "packs" | "suscripciones";

/**
 * Packs y suscripciones (L3): dos pestañas del mismo módulo (`?ver=`). Los packs se arman acá y se ven en la tienda;
 * las suscripciones son simuladas (nada se cobra ni se envía) y "Qué preparar" lista las entregas que vienen.
 */
export function PacksModule() {
  const params = useSearchParams();
  const mode: Mode = params.get("ver") === "suscripciones" ? "suscripciones" : "packs";
  const packs = useAdmin((s) => s.data.packs);
  const subs = useSubscriptions((s) => s.subscriptions);
  const setMode = (m: Mode) => {
    // Cada pestaña arranca limpia: sin la búsqueda, los filtros ni la página de la otra.
    window.history.replaceState(null, "", m === "suscripciones" ? "?ver=suscripciones" : window.location.pathname);
  };
  return (
    <>
      <AdminPageHeader title="Packs y suscripciones" actions={<ButtonLink href={NEW_PACK}><Plus size={18} aria-hidden="true" /> Nuevo pack</ButtonLink>}>
        Productos que se llevan juntos para un objetivo o un deporte, con descuento, y la opción de recibirlos todos los meses. Las suscripciones son simuladas: no se cobra nada.
      </AdminPageHeader>
      <div className="mb-4">
        <TabFilter label="Mostrar" value={mode} onChange={setMode}
          tabs={[{ id: "packs", label: "Packs", count: packs.length }, { id: "suscripciones", label: "Suscripciones", count: activeSubscriptions(subs) }]} />
      </div>
      {mode === "packs" ? <PacksTable /> : <SubscriptionsTab />}
    </>
  );
}
