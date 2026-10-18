"use client";
import type { ReactNode } from "react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

interface Props {
  code: string;
  amount: number;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

/**
 * Aprobar un comprobante (Hoy, Por cobrar y las fichas): siempre pregunta si el ingreso ya se vio en la cuenta. Recién
 * con "Sí, lo verifiqué" el pedido pasa a Pagado; subir un comprobante nunca lo hace solo.
 */
export function ApproveProofButton({ code, amount, children, variant = "primary", className }: Props) {
  const approveProof = useAdmin((s) => s.approveProof);
  const save = useDemoSave();
  return (
    <ConfirmButton variant={variant} size="sm" className={className} title={`Aprobar el comprobante de ${code}`} confirmLabel="Sí, lo verifiqué"
      description={<>¿Ya viste en tu cuenta el ingreso de <strong>{formatARS(amount)}</strong>? Recién ahí el pedido pasa a <strong>Pagado</strong> y entra en la lista para armar. Si no entró, cancelá y rechazá el comprobante con el motivo.</>}
      onConfirm={() => save("Comprobante aprobado", () => approveProof(code), "El pedido pasó a Pagado y está para armar. Cambio guardado solo en esta demo.")}>
      {children}
    </ConfirmButton>
  );
}
