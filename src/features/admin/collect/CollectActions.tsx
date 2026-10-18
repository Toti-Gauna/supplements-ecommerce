"use client";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { AdminOrder } from "@/demo/admin/types";
import { useAdmin } from "@/stores/admin";
import { OrderWhatsapp } from "../orders/OrderWhatsapp";
import { ProofActions } from "../payments/ProofActions";
import { SimulateProvider } from "../payments/SimulateProvider";
import { useDemoSave } from "../useDemoSave";

/**
 * Qué se puede hacer con un pedido por cobrar: revisar el comprobante (aprobar pide confirmar el ingreso), simular lo
 * que en la tienda real llega solo, escribirle por WhatsApp o cancelar lo que no se va a pagar.
 */
export function CollectActions({ order }: { order: AdminOrder }) {
  const transition = useAdmin((s) => s.transition);
  const save = useDemoSave();
  const unpaid = order.status === "PENDING_PAYMENT";
  return (
    <div className="flex flex-col gap-3">
      <ProofActions order={order} />
      <div className="flex flex-wrap items-center gap-2">
        {unpaid && order.paymentMethod === "CHECKOUT_PRO" && <SimulateProvider code={order.code} />}
        <OrderWhatsapp order={order} />
        {unpaid && (
          <ConfirmButton size="sm" variant="danger" title={`Cancelar el pedido ${order.code}`} confirmLabel="Sí, cancelarlo"
            description="Usalo si el cliente avisó que no lo va a pagar. El pedido sale de Por cobrar y queda en el historial como cancelado."
            onConfirm={() => save("Pedido cancelado", () => transition(order.code, "CANCELLED", "Cancelado desde Por cobrar: no se pagó"))}>
            Cancelar el pedido
          </ConfirmButton>
        )}
      </div>
    </div>
  );
}
