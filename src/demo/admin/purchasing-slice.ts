import type { StockLevel, Supplier } from "../fixtures/suppliers";
import { auditEntry, type AdminData } from "./defaults";
import { checkLevel, receiveStock } from "./workshop/purchase-orders";
import type { PurchaseOrder } from "./workshop/purchasing";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

/** Proveedores y compras (Fase 7): niveles de stock por variante, proveedores y pedidos hechos (todo en este navegador). */
export interface PurchasingActions {
  /** Guarda el mínimo y el objetivo de una variante; devuelve el motivo si no son válidos. */
  saveStockLevel: (key: string, level: StockLevel) => string | null;
  saveSupplier: (supplier: Supplier) => void;
  /** Registra un pedido hecho al proveedor (por WhatsApp, fuera de la demo). */
  addPurchase: (order: PurchaseOrder) => void;
  /** Llegó la mercadería: suma las unidades al stock de cada variante. */
  receivePurchase: (id: string) => boolean;
  /** Anula un pedido que no se va a recibir: lo pedido vuelve a sugerirse. */
  cancelPurchase: (id: string) => void;
}

export function createPurchasingActions(set: Set): PurchasingActions {
  const log = (s: AdminData, action: string, entity: string) => [auditEntry(action, entity), ...s.audit].slice(0, 80);
  return {
    saveStockLevel: (key, level) => {
      const error = checkLevel(level);
      if (!error) set((s) => ({ workshop: { ...s.workshop, stockLevels: { ...s.workshop.stockLevels, [key]: level } }, audit: log(s, `Stock mínimo ${level.min} y objetivo ${level.target}`, key) }));
      return error;
    },
    saveSupplier: (supplier) => set((s) => ({
      workshop: { ...s.workshop, suppliers: s.workshop.suppliers.map((x) => (x.id === supplier.id ? supplier : x)) },
      audit: log(s, "Proveedor guardado", supplier.name),
    })),
    addPurchase: (order) => set((s) => ({ workshop: { ...s.workshop, purchases: [order, ...s.workshop.purchases] }, audit: log(s, `Pedido al proveedor (${order.lines.length} productos)`, order.supplierId) })),
    receivePurchase: (id) => {
      let ok = false;
      set((s) => {
        const order = s.workshop.purchases.find((p) => p.id === id && p.status === "ordered");
        if (!order) return {};
        ok = true;
        return {
          data: { ...s.data, products: receiveStock(s.data.products, order) },
          workshop: { ...s.workshop, purchases: s.workshop.purchases.map((p) => (p.id === id ? { ...p, status: "received", receivedAt: new Date().toISOString() } : p)) },
          audit: log(s, "Mercadería recibida: stock actualizado", order.supplierId),
        };
      });
      return ok;
    },
    cancelPurchase: (id) => set((s) => ({ workshop: { ...s.workshop, purchases: s.workshop.purchases.filter((p) => p.id !== id || p.status !== "ordered") }, audit: log(s, "Pedido al proveedor anulado", id) })),
  };
}
