"use client";
import { ArrowRight, Check, MessageCircle, Tag, Truck } from "lucide-react";
import { ButtonLink, Button } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { TodayAction } from "@/demo/engine/today";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";

interface Props {
  action: TodayAction;
  /** Lo urgente (atrasado o para hoy) lleva el botón lleno; lo demás, la placa de acero. */
  strong: boolean;
  onClearance: (lotKey: string, pct: number) => void;
  onRepurchase: (keys: string[]) => void;
}

const WIDE = "w-full justify-between sm:w-auto sm:min-w-[13rem]";

/** El único botón de cada fila: resuelve ahí (siempre con confirmación) o lleva exactamente al lugar. */
export function TodayCtaButton({ action, strong, onClearance, onRepurchase }: Props) {
  const approveProof = useAdmin((s) => s.approveProof);
  const transition = useAdmin((s) => s.transition);
  const save = useDemoSave();
  const variant = strong ? "primary" : "secondary";
  const { cta } = action;
  switch (cta.type) {
    case "approve":
      return (
        <ConfirmButton variant={variant} size="sm" className={WIDE} title={`Aprobar el comprobante de ${cta.code}`} confirmLabel="Sí, lo verifiqué"
          description={<>¿Ya viste en tu cuenta el ingreso de <strong>{formatARS(cta.amount)}</strong>? Recién ahí el pedido pasa a <strong>Pagado</strong> y entra en la lista para armar. Si no entró, cancelá y abrí el comprobante para rechazarlo.</>}
          onConfirm={() => save("Comprobante aprobado", () => approveProof(cta.code), "El pedido pasó a Pagado y está para armar. Cambio guardado solo en esta demo.")}>
          {cta.label} <Check size={15} aria-hidden="true" />
        </ConfirmButton>
      );
    case "dispatch":
      return (
        <ConfirmButton variant={variant} size="sm" className={WIDE} title={cta.to === "DELIVERED" ? `${cta.code}: ¿ya lo retiraron?` : `${cta.code}: ¿ya salió?`}
          confirmLabel={cta.label}
          description={cta.to === "DELIVERED" ? "Marcalo cuando el cliente se lo lleva del local." : "Marcalo cuando se lo entregás al cadete o al correo. El cliente recibe el aviso de envío (en la demo queda en la bandeja de salida)."}
          onConfirm={() => save(cta.to === "DELIVERED" ? "Pedido entregado" : "Pedido enviado", () => transition(cta.code, cta.to))}>
          {cta.label} <Truck size={15} aria-hidden="true" />
        </ConfirmButton>
      );
    case "clearance":
      return <Button variant={variant} size="sm" className={WIDE} onClick={() => onClearance(cta.lotKey, cta.pct)}>{cta.label} <Tag size={15} aria-hidden="true" /></Button>;
    case "repurchase":
      return <Button variant={variant} size="sm" className={WIDE} onClick={() => onRepurchase(cta.keys)}>{cta.label} <MessageCircle size={15} aria-hidden="true" /></Button>;
    default:
      return <ButtonLink href={cta.href} variant={variant} size="sm" className={WIDE}>{cta.label} <ArrowRight size={15} aria-hidden="true" /></ButtonLink>;
  }
}
