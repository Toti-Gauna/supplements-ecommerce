import { emailTemplates, type EmailTemplate } from "../fixtures/emails";
import { auditEntry, type AdminData } from "./defaults";
import { sampleContext } from "./emails/context";
import { composeEmails, pushOutbox } from "./emails/triggers";
import { brand } from "@/config/brand";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;
type Get = () => AdminData;

export interface EmailActions {
  saveEmailTemplate: (template: EmailTemplate) => void;
  setEmailTemplateActive: (id: string, active: boolean) => void;
  /** Vuelve una plantilla a la versión de muestra. */
  resetEmailTemplate: (id: string) => void;
  /** Envío de prueba a la casilla de la tienda (demo) con un pedido de muestra (o su producto, en la recompra). */
  sendTestEmail: (templateId: string, orderCode: string) => boolean;
  clearOutbox: () => void;
}

export const TEST_INBOX = `tienda@${brand.demoDomain}`;

export function createEmailActions(set: Set, get: Get): EmailActions {
  const edit = (action: string, entity: string, fn: (s: AdminData) => Partial<AdminData["emails"]>) =>
    set((s) => ({ emails: { ...s.emails, ...fn(s) }, audit: [auditEntry(action, entity), ...s.audit].slice(0, 80) }));
  const templates = (s: AdminData, fn: (t: EmailTemplate) => EmailTemplate, id: string) => ({ templates: s.emails.templates.map((t) => (t.id === id ? fn(t) : t)) });

  return {
    saveEmailTemplate: (tpl) => edit("Plantilla de email guardada", tpl.name, (s) => templates(s, () => tpl, tpl.id)),
    setEmailTemplateActive: (id, active) => edit(active ? "Email automático activado" : "Email automático pausado", id, (s) => templates(s, (t) => ({ ...t, active }), id)),
    resetEmailTemplate: (id) => {
      const original = emailTemplates.find((t) => t.id === id);
      if (original) edit("Plantilla de email restaurada", original.name, (s) => templates(s, (t) => ({ ...structuredClone(original), active: t.active }), id));
    },
    sendTestEmail: (templateId, orderCode) => {
      const s = get();
      const tpl = s.emails.templates.find((t) => t.id === templateId);
      if (!tpl) return false;
      // La prueba usa el mismo contexto que la vista previa (la recompra no lleva pedido, sino el producto).
      const ctx = { ...sampleContext(tpl, s.orders, orderCode), email: TEST_INBOX };
      if (tpl.trigger === "repurchase" ? !ctx.refill : !ctx.order) return false;
      const [mail] = composeEmails([tpl], [tpl.trigger], ctx, new Date().toISOString(), { orderCode: ctx.order?.code, force: true });
      edit("Email de prueba", tpl.name, (st) => ({ outbox: pushOutbox(st.emails.outbox, [{ ...mail!, test: true }]) }));
      return true;
    },
    clearOutbox: () => edit("Bandeja de salida vaciada", "Emails", () => ({ outbox: [] })),
  };
}
