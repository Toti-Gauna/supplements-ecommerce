"use client";
import { Cake, Copy, Mail, PawPrint, RefreshCw } from "lucide-react";
import { REMINDER_LABEL, type Reminder } from "@/demo/admin/workshop/reminders";
import { formatDay } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

const ICON = { "pet-birthday": PawPrint, birthday: Cake, repurchase: RefreshCw };

export function whenText(inDays: number): string {
  if (inDays === 0) return "hoy";
  if (inDays === 1) return "mañana";
  return inDays > 0 ? `en ${inDays} días` : `hace ${-inDays} días`;
}

export function profileHref(email: string): string {
  return `/admin-demo/usuarios/ficha/?email=${encodeURIComponent(email)}`;
}

/** Copia el mensaje sugerido para pegarlo en WhatsApp o en un email (la demo no envía nada). */
export function useCopyMessage() {
  const push = useToasts((s) => s.push);
  return async (text: string) => {
    try { await navigator.clipboard.writeText(text); push({ tone: "success", title: "Mensaje copiado", description: "Pegalo en WhatsApp o en un email. La demo no envía nada." }); }
    catch { push({ tone: "error", title: "No se pudo copiar", description: "Tu navegador no dejó usar el portapapeles." }); }
  };
}

/** Recordatorios de la ficha: cumpleaños de mascotas, del cliente y recompras, con el mensaje listo para copiar. */
export function ReminderList({ reminders }: { reminders: Reminder[] }) {
  const copy = useCopyMessage();
  const sendPet = useAdmin((s) => s.sendPetBirthdayEmail);
  const push = useToasts((s) => s.push);
  const send = (r: Reminder) => {
    const result = r.petId ? sendPet(r.email, r.name, r.petId, r.date.slice(0, 4)) : "off";
    if (result === "sent") push({ tone: "success", title: "Email de cumpleaños en la bandeja de salida", description: "En producción sale solo el día del cumpleaños. La demo no envía nada.", action: { label: "Ver la bandeja", href: "/admin-demo/emails/enviados/" } });
    else if (result === "already") push({ tone: "info", title: "Ya salió este año", description: "El email de este cumpleaños ya está en la bandeja de salida." });
    else push({ tone: "error", title: "No se pudo armar el email", description: "Revisá que el email de cumpleaños esté activo en Emails automáticos." });
  };
  return (
    <ul className="flex flex-col gap-2">
      {reminders.map((r) => {
        const Icon = ICON[r.kind];
        return (
          <li key={r.id} className="@container rounded-2xl bg-bg p-3">
            <div className="flex flex-col gap-3 @min-[36rem]:flex-row @min-[36rem]:items-center">
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <span aria-hidden="true" className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", r.kind === "repurchase" ? "bg-accent text-ink" : "bg-brass/25 text-brass-ink")}><Icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{r.title}</span>
                  <span className="text-sm text-muted">{REMINDER_LABEL[r.kind]} · {formatDay(r.date)} ({whenText(r.inDays)})</span>
                </span>
              </span>
              {/* 8.3.13: los botones van debajo del texto si no entran al costado. */}
              <span className="flex flex-wrap gap-2 @min-[36rem]:shrink-0">
                {r.kind === "pet-birthday" && r.petId && (
                  <button type="button" onClick={() => send(r)} aria-label={`Simular el email del día: ${r.title}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-bold text-on-primary hover:bg-primary-hover">
                    <Mail size={15} aria-hidden="true" /> Simular el email del día
                  </button>
                )}
                <button type="button" onClick={() => copy(r.message)} aria-label={`Copiar mensaje: ${r.title}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 bg-surface px-3.5 text-sm font-bold hover:bg-accent/50">
                  <Copy size={15} aria-hidden="true" /> Copiar mensaje
                </button>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
