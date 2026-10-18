"use client";
import { MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/atoms/Button";
import type { AdminOrder } from "@/demo/admin/types";
import { orderWhatsapp } from "@/demo/admin/whatsapp";
import { cn } from "@/lib/cn";
import { useWhatsappTexts } from "@/stores/whatsapp";

interface Props {
  order: AdminOrder;
  /** Solo el ícono (filas de tabla): el nombre accesible igual dice a quién y por qué pedido. */
  compact?: boolean;
  variant?: "secondary" | "ghost";
  className?: string;
}

/**
 * "Escribirle por WhatsApp" (R4b): abre WhatsApp con el mensaje del estado del pedido ya escrito, al teléfono del
 * cliente. Se abre en otra pestaña y nada se manda solo. El texto sale de Ajustes → Emails (versión WhatsApp).
 */
export function OrderWhatsapp({ order, compact = false, variant = "secondary", className }: Props) {
  const texts = useWhatsappTexts((s) => s.texts);
  const wa = orderWhatsapp(order, texts);
  if (!wa.href) return <span className={cn("text-xs font-semibold text-muted", className)}>Sin WhatsApp cargado</span>;
  const who = `a ${order.customer.name} (${order.code}, se abre en otra pestaña)`;
  return (
    <a href={wa.href} target="_blank" rel="noopener noreferrer" title={wa.text} data-wa={wa.id} aria-label={compact ? `Escribirle por WhatsApp ${who}` : undefined}
      className={cn(buttonClass(variant, "sm", compact ? "min-h-10 w-10 px-0" : "min-h-10 px-3.5"), className)}>
      <MessageCircle size={15} aria-hidden="true" />
      {!compact && <>Escribirle por WhatsApp<span className="sr-only"> {who}</span></>}
    </a>
  );
}
