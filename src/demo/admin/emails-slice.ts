import { emailTemplates, type EmailTemplate } from "../fixtures/emails";
import { auditEntry, type AdminData } from "./defaults";
import { contextForOrder, petSampleContext } from "./emails/render";
import { composeEmails, pushOutbox } from "./emails/triggers";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;
type Get = () => AdminData;

export interface EmailActions {
  saveEmailTemplate: (template: EmailTemplate) => void;
  setEmailTemplateActive: (id: string, active: boolean) => void;
  /** Vuelve una plantilla a la versión de muestra. */
  resetEmailTemplate: (id: string) => void;
  /** Envío de prueba a la casilla del taller (demo) con un pedido de muestra. */
  sendTestEmail: (templateId: string, orderCode: string) => boolean;
  /** Cumpleaños de una mascota de la ficha: arma el email si la plantilla está activa (una vez por año y mascota). */
  sendPetBirthdayEmail: (email: string, name: string, petId: string, year: string) => "sent" | "already" | "off";
  clearOutbox: () => void;
}

export const TEST_INBOX = "taller@volta.demo";

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
      const order = s.orders.find((o) => o.code === orderCode);
      if (!tpl || (!order && tpl.trigger !== "pet-birthday")) return false;
      // La prueba usa el mismo contexto que la vista previa: el cumpleaños no lleva pedido.
      const base = tpl.trigger === "pet-birthday" ? petSampleContext(s.workshop.profiles, s.orders, s.users) : contextForOrder(order!);
      const ctx = { ...base, email: TEST_INBOX };
      const [mail] = composeEmails([{ ...tpl, active: true }], [tpl.trigger], ctx, new Date().toISOString(), tpl.trigger === "pet-birthday" ? undefined : order!.code);
      edit("Email de prueba", tpl.name, (st) => ({ outbox: pushOutbox(st.emails.outbox, [{ ...mail!, test: true }]) }));
      return true;
    },
    sendPetBirthdayEmail: (email, name, petId, year) => {
      const s = get();
      const pet = s.workshop.profiles[email.toLowerCase()]?.pets.find((p) => p.id === petId);
      if (!pet) return "off";
      const key = `pet-birthday:${email.toLowerCase()}:${petId}:${year}`;
      if (s.emails.outbox.some((m) => m.key === key)) return "already";
      const mails = composeEmails(s.emails.templates, ["pet-birthday"], { customerName: name, email, pet: { name: pet.name } }, new Date().toISOString(), undefined, key);
      if (!mails.length) return "off";
      edit(`Email de cumpleaños de ${pet.name}`, email, (st) => ({ outbox: pushOutbox(st.emails.outbox, mails) }));
      return "sent";
    },
    clearOutbox: () => edit("Bandeja de salida vaciada", "Emails", () => ({ outbox: [] })),
  };
}
