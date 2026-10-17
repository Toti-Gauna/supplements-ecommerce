"use client";
import { demoNow } from "@/demo/clock";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCatalogActions, type CatalogActions } from "@/demo/admin/catalog-slice";
import { createCustomerActions, type CustomerActions } from "@/demo/admin/customers-slice";
import { normalizeHeroList } from "@/demo/admin/content-hero";
import { migrateAdminData } from "@/demo/admin/migrate";
import { createDataActions, type DataActions } from "@/demo/admin/data-slice";
import { auditEntry, defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { createOrdersActions, type OrdersActions } from "@/demo/admin/orders-slice";
import { createPackActions, type PacksActions } from "@/demo/admin/packs-slice";
import { createPurchasingActions, type PurchasingActions } from "@/demo/admin/purchasing-slice";
import { withPrizeCatalog } from "@/demo/admin/wheel-prizes";
import type { AdminClaim } from "@/demo/admin/types";
import { createWorkshopActions, type WorkshopActions } from "@/demo/admin/workshop-slice";
import { createEmailActions, type EmailActions } from "@/demo/admin/emails-slice";
import { createGiftsActions, type GiftsActions } from "@/demo/admin/gifts-slice";
import { setDemoData, type DemoData } from "@/demo/engine/source";
import { ADMIN_STORE_VERSION, demoStorage, STORAGE_PREFIX } from "./storage";

export type AdminState = AdminData & OrdersActions & DataActions & CatalogActions & WorkshopActions & PurchasingActions & EmailActions & CustomerActions & PacksActions & GiftsActions & {
  addClaim: (claim: Omit<AdminClaim, "id" | "status" | "createdAt">) => void;
  resetAdmin: () => void;
};

/**
 * Estado del PANEL DEMO: solo en este navegador. No hay login, API ni base de datos.
 * La tienda lee `data` (catálogo, cupones, misiones, ajustes, contenido) para reflejar los cambios.
 */
export const useAdmin = create<AdminState>()(
  persist(
    (set, get) => ({
      ...defaultAdminData(),
      ...createOrdersActions(set, get),
      ...createDataActions(set),
      ...createCatalogActions(set),
      ...createWorkshopActions(set),
      ...createPurchasingActions(set),
      ...createEmailActions(set, get),
      ...createCustomerActions(set, get),
      ...createPackActions(set, get),
      ...createGiftsActions(set, get),
      addClaim: (claim) =>
        set((s) => ({
          claims: [{ ...claim, id: `c-${Date.now().toString(36)}`, status: "OPEN", createdAt: demoNow(), fromShop: true }, ...s.claims],
          audit: [auditEntry("Arrepentimiento recibido desde la tienda", claim.code), ...s.audit],
        })),
      resetAdmin: () => set(defaultAdminData()),
    }),
    {
      name: `${STORAGE_PREFIX}admin`,
      // v4: taller (fechas comprometidas, etapas, insumos, recetas y fichas). v5: configurador del collar (producto nuevo).
      // v6: temáticas de la Fase 5 (Orgullo en lugar de San Patricio y fechas patrias, con sus cupones).
      // v7: VOLTA, tienda de suplementos (catálogo, costos con proveedor, sin personalización, descuento stack).
      // v8: ruleta "Disco olímpico" con premios de suplementos (muestra y shaker de regalo en lugar de grabado y llavero).
      // v10: panel de las Fases 6 y 7 (fichas sin mascotas, con objetivo y avisos de recompra; lotes y vencimientos por
      // variante, último aumento de precios, objetivos editables; emails de suplementos y premios del juego editables;
      // preparación con control de lote, cupo del cadete, costos sin horas de taller, proveedores y compras).
      // v13: imágenes del carrusel. Las versiones de suplementos conservan datos y ediciones del dueño.
      version: ADMIN_STORE_VERSION,
      storage: demoStorage,
      skipHydration: true,
      migrate: migrateAdminData,
      // Campos nuevos de `data` toman el valor por defecto si el estado guardado no los tiene.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AdminData>;
        const workshop = { ...current.workshop, ...(p.workshop ?? {}) };
        // Las entradas del calendario (8.3.15) llegaron después: si faltan o vienen rotas, quedan las de muestra.
        if (!Array.isArray(workshop.events)) workshop.events = current.workshop.events;
        const data = { ...current.data, ...(p.data ?? {}) };
        // La ruleta guardada antes de 8.3.25 no tenía catálogo de premios: se completa con sus gajos, sin cambiar IDs.
        data.wheel = withPrizeCatalog(data.wheel);
        // El carrusel vive en content.hero. Una imagen rota vuelve al envase sin perder los textos del dueño.
        const content = { ...current.data.content, ...data.content } as DemoData["content"] & { slides?: unknown };
        delete content.slides;
        data.content = { ...content, hero: normalizeHeroList(content.hero) ?? current.data.content.hero };
        return { ...current, ...p, data, workshop, emails: { ...current.emails, ...(p.emails ?? {}) } };
      },
      partialize: (s) => ({ data: s.data, orders: s.orders, users: s.users, claims: s.claims, audit: s.audit, lastImport: s.lastImport, lastPriceChange: s.lastPriceChange, workshop: s.workshop, emails: s.emails }),
    },
  ),
);

// El engine (sin React) lee siempre la versión vigente.
setDemoData(useAdmin.getState().data);
useAdmin.subscribe((s) => setDemoData(s.data));

/** Lectura reactiva de los datos editables desde componentes de la tienda o del panel. */
export function useDemoData<T>(selector: (d: DemoData) => T): T {
  return useAdmin((s) => selector(s.data));
}

/** Re-render cuando cambia cualquier dato editable; el engine ya lee la versión nueva. */
export function useDemoVersion(): DemoData {
  return useAdmin((s) => s.data);
}
