"use client";
import { Check, X } from "lucide-react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { AdminOrder } from "@/demo/admin/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

/**
 * Aprobar o rechazar un comprobante (simulado y siempre a mano), o simular que llegó uno. Aprobar exige confirmar que
 * se verificó el ingreso; rechazar exige un motivo. Subir un comprobante nunca marca el pedido como pagado.
 */
export function ProofActions({ order }: { order: AdminOrder }) {
  const { approveProof, rejectProof, receiveProof } = useAdmin();
  const save = useDemoSave();
  if (order.paymentMethod === "CHECKOUT_PRO") return null;
  if (order.status === "PENDING_PAYMENT") {
    return (
      <ConfirmButton variant="secondary" size="sm" className="self-start" title="Simular comprobante recibido" confirmLabel="Simular"
        description="Así llega un comprobante subido por el comprador. El pedido pasa a revisión: subir un comprobante NUNCA lo marca como pagado."
        onConfirm={() => save("Comprobante simulado recibido", () => receiveProof(order.code, `comprobante-${order.code.slice(-3)}.jpg`))}>
        Simular comprobante recibido
      </ConfirmButton>
    );
  }
  if (order.proof?.status !== "IN_REVIEW") return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="rounded-xl bg-warning-soft p-2.5 text-xs font-bold text-warning">Antes de aprobar, Volta verifica el ingreso en su cuenta. En la demo no hay cuenta real: aprobar solo cambia el estado local.</p>
      <div className="flex flex-wrap gap-2">
        <ConfirmButton size="sm" title={`Aprobar comprobante de ${order.code}`} confirmLabel="Aprobar (demo)"
          description={<>¿Confirmás que verificaste el ingreso de <strong>{formatARS(order.total)}</strong>? El pedido pasa a <strong>Pagado</strong> en esta demo y queda en el historial.</>}
          onConfirm={() => save("Comprobante aprobado (demo)", () => approveProof(order.code))}>
          <Check size={16} aria-hidden="true" /> Aprobar
        </ConfirmButton>
        <ConfirmButton size="sm" variant="danger" title={`Rechazar comprobante de ${order.code}`} confirmLabel="Rechazar" reasonLabel="Motivo del rechazo"
          description="El pedido vuelve a pendiente de pago y el comprador puede subir otro comprobante."
          onConfirm={(reason) => save("Comprobante rechazado (demo)", () => rejectProof(order.code, reason))}>
          <X size={16} aria-hidden="true" /> Rechazar
        </ConfirmButton>
      </div>
    </div>
  );
}

export const PROOF_STATE = {
  IN_REVIEW: { tone: "warning", label: "En revisión" },
  APPROVED: { tone: "success", label: "Aprobado a mano (demo)" },
  REJECTED: { tone: "danger", label: "Rechazado" },
} as const;

export const paymentHref = (code: string) => `/admin-demo/pagos/detalle/?codigo=${code}`;
