import { beforeEach, describe, expect, it } from "vitest";
import { useAdmin } from "@/stores/admin";
import { demoData } from "@/demo/engine/source";

const order = (code: string) => useAdmin.getState().orders.find((o) => o.code === code)!;
beforeEach(() => useAdmin.getState().resetAdmin());

describe("panel demo: pagos manuales", () => {
  it("recibir un comprobante deja el pedido en revisión, nunca pagado", () => {
    expect(useAdmin.getState().receiveProof("VOL-000125", "comprobante.pdf")).toBe(true);
    expect(order("VOL-000125").status).toBe("PAYMENT_REVIEW");
    expect(order("VOL-000125").proof?.status).toBe("IN_REVIEW");
  });
  it("aprobar pasa a pagado y deja auditoría", () => {
    expect(useAdmin.getState().approveProof("VOL-000123")).toBe(true);
    expect(order("VOL-000123").status).toBe("PAID");
    expect(useAdmin.getState().audit[0]?.entity).toBe("VOL-000123");
  });
  it("rechazar con motivo vuelve a pendiente de pago", () => {
    useAdmin.getState().rejectProof("VOL-000124", "Monto distinto");
    expect(order("VOL-000124").status).toBe("PENDING_PAYMENT");
    expect(order("VOL-000124").proof).toMatchObject({ status: "REJECTED", rejectReason: "Monto distinto" });
  });
  it("no permite saltear el cobro manualmente", () => {
    expect(useAdmin.getState().transition("VOL-000125", "PAID")).toBe(false);
    expect(useAdmin.getState().approveProof("VOL-000125")).toBe(false);
  });
});

describe("panel demo: catálogo y reset", () => {
  it("editar stock actualiza los datos que lee la tienda y el reset vuelve a fixtures", () => {
    const p = demoData().products.find((x) => x.slug === "overvolt-pre")!;
    useAdmin.getState().saveProduct({ ...p, variants: p.variants.map((v) => ({ ...v, stock: 0 })) });
    expect(demoData().products.find((x) => x.slug === "overvolt-pre")!.variants[0]!.stock).toBe(0);
    useAdmin.getState().resetAdmin();
    expect(demoData().products.find((x) => x.slug === "overvolt-pre")!.variants[0]!.stock).toBe(12);
  });
});
