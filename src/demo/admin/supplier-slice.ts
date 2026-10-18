import { DEMO_TODAY } from "../fixtures/admin-orders";
import { demoNow } from "../clock";
import { auditEntry, type AdminData } from "./defaults";
import { withPriceLog } from "./price-log";
import { applyUpdates, type ListUpdate } from "./supplier-list/apply";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

export interface SupplierActions {
  /** Aplica costos y/o precios nuevos (lista del proveedor o aumento por margen); el último cambio se deshace. */
  applyListUpdates: (updates: ListUpdate[], label: string) => void;
  /** Margen objetivo de una marca (1 a 90 %); null vuelve al general de la tienda. */
  setBrandMargin: (brand: string, pct: number | null) => void;
}

export function createSupplierActions(set: Set): SupplierActions {
  return {
    applyListUpdates: (updates, label) =>
      set((s) => {
        const { products, undo } = applyUpdates(s.data.products, updates, label, DEMO_TODAY, demoNow());
        return { data: { ...s.data, ...withPriceLog(s.data, products) }, lastPriceChange: undo, audit: [auditEntry(`Precios ${label}`, `${undo.count} variantes`), ...s.audit].slice(0, 80) };
      }),
    setBrandMargin: (brand, pct) =>
      set((s) => {
        const margins = { ...(s.workshop.settings.brandMargins ?? {}) };
        if (pct === null) delete margins[brand]; else margins[brand] = Math.min(90, Math.max(1, Math.round(pct)));
        return { workshop: { ...s.workshop, settings: { ...s.workshop.settings, brandMargins: margins } }, audit: [auditEntry(`Margen de ${brand}: ${pct === null ? "el general" : `${margins[brand]} %`}`, "Compras"), ...s.audit].slice(0, 80) };
      }),
  };
}
