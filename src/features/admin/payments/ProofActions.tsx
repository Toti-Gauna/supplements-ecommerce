"use client";
import { Check, X } from "lucide-react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { AdminOrder } from "@/demo/admin/types";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";
import { ApproveProofButton } from "./ApproveProofButton";
import { brand } from "@/config/brand";

/**
 * Aprobar o rechazar un comprobante (simulado y siempre a mano), o simular que llegó uno. Aprobar exige confirmar que
 * se verificó el ingreso; rechazar exige un motivo. Subir un comprobante nunca marca el pedido como pagado.
 */
export function ProofActions({ order }: { order: AdminOrder }) {
  const { rejectProof, receiveProof } = useAdmin();
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
      <p className="rounded-sm bg-warning-soft p-2.5 text-xs font-bold text-warning">Antes de aprobar, mirá en la cuenta de {brand.name} que el ingreso haya entrado. En la demo no hay cuenta real: aprobar solo cambia el estado local.</p>
      <div className="flex flex-wrap gap-2">
        <ApproveProofButton code={order.code} amount={order.total}><Check size={16} aria-hidden="true" /> Aprobar</ApproveProofButton>
        <ConfirmButton size="sm" variant="danger" title={`Rechazar comprobante de ${order.code}`} confirmLabel="Rechazar" reasonLabel="Motivo del rechazo"
          description="El pedido vuelve a pendiente de pago y el comprador puede subir otro comprobante."
          onConfirm={(reason) => save("Comprobante rechazado", () => rejectProof(order.code, reason))}>
          <X size={16} aria-hidden="true" /> Rechazar
        </ConfirmButton>
      </div>
    </div>
  );
}

export const PROOF_STATE = {
  IN_REVIEW: { tone: "warning", label: "En revisión" },
  APPROVED: { tone: "success", label: "Aprobado a mano" },
  REJECTED: { tone: "danger", label: "Rechazado" },
} as const;

export const paymentHref = (code: string) => `/admin-demo/pagos/detalle/?codigo=${code}`;
