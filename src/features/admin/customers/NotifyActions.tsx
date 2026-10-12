"use client";
import { Check, Mail, MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { noticeFor, type RepurchaseItem } from "@/demo/admin/repurchase";
import { customerWhatsappLink, repurchaseMessage } from "@/demo/admin/repurchase-text";
import type { NoticeChannel } from "@/demo/fixtures/customers";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

const CHANNEL: Record<NoticeChannel, string> = { email: "por email", whatsapp: "por WhatsApp" };
const OUTBOX = "/admin-demo/emails/enviados/";

/** Manda el aviso de recompra y cuenta qué pasó (la demo no envía nada: el email queda en la bandeja de salida). */
function useNotify(item: RepurchaseItem) {
  const notify = useAdmin((s) => s.notifyRepurchase);
  const push = useToasts((s) => s.push);
  const email = () => {
    const result = notify(item, "email");
    if (result === "sent") push({ tone: "success", title: "Email de recompra en la bandeja de salida", description: `“Tu pote se está por terminar” para ${item.name}. La demo no envía nada.`, action: { label: "Ver la bandeja", href: OUTBOX } });
    else if (result === "already") push({ tone: "info", title: "Ya le avisaste", description: "Este aviso ya salió: no se manda dos veces." });
    else push({ tone: "error", title: "El email de recompra está pausado", description: "Activalo en Emails automáticos para poder mandarlo.", action: { label: "Ir a Emails", href: "/admin-demo/emails/" } });
  };
  const whatsapp = () => {
    if (notify(item, "whatsapp") === "sent") push({ tone: "success", title: "WhatsApp listo para mandar", description: "Se abrió con el mensaje escrito y quedó anotado que le avisaste." });
  };
  return { email, whatsapp };
}

/**
 * Avisarle al cliente que se le termina un pote: email "Tu pote se está por terminar" o WhatsApp prellenado. Una vez
 * avisado (por cualquiera de los dos), muestra cuándo y por dónde, y no deja repetir el aviso.
 */
export function NotifyActions({ item, className }: { item: RepurchaseItem; className?: string }) {
  const notice = useAdmin((s) => noticeFor(s.workshop.profiles[item.email.toLowerCase()], item));
  const send = useNotify(item);
  if (notice) {
    return (
      <p className={cn("inline-flex items-center gap-1.5 text-sm font-bold text-success", className)}>
        <Check size={16} aria-hidden="true" />Avisado {CHANNEL[notice.channel]} · {formatDateTime(notice.at)}
      </p>
    );
  }
  const whatsapp = customerWhatsappLink(item.phone, repurchaseMessage(item, brand.name));
  return (
    <span className={cn("flex flex-wrap gap-2", className)}>
      <button type="button" onClick={send.email} aria-label={`Avisarle por email a ${item.name}: ${item.product}`} className={buttonClass("primary", "sm", "min-h-10 px-3.5")}>
        <Mail size={15} aria-hidden="true" />Avisarle por email
      </button>
      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={send.whatsapp} aria-label={`WhatsApp a ${item.name}: ${item.product} (se abre en otra pestaña)`}
          className={buttonClass("secondary", "sm", "min-h-10 px-3.5")}>
          <MessageCircle size={15} aria-hidden="true" />WhatsApp
        </a>
      )}
    </span>
  );
}
