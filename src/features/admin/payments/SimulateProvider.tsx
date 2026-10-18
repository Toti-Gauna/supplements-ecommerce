"use client";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

/**
 * Simula la confirmación de Mercado Pago de un pedido sin pagar. En producción llega por webhook firmado y el
 * servidor verifica monto, moneda y referencia: nunca se aprueba a mano.
 */
export function SimulateProvider({ code, className }: { code: string; className?: string }) {
  const confirmProvider = useAdmin((s) => s.confirmProvider);
  const save = useDemoSave();
  return (
    <ConfirmButton size="sm" variant="secondary" className={className} title="Simular notificación de Mercado Pago" confirmLabel="Simular"
      description="En producción, el pedido pasa a Pagado solo cuando llega el webhook firmado y el servidor verifica monto, moneda y referencia. Esto es una simulación local."
      onConfirm={() => save("Confirmación del proveedor simulada", () => confirmProvider(code))}>
      Simular confirmación de Mercado Pago
    </ConfirmButton>
  );
}
