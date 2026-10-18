"use client";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { Sheet } from "@/components/motion/Sheet";
import { runOutLine } from "@/demo/admin/repurchase-text";
import type { TodaySnapshot } from "@/demo/engine/today";
import { dueRepurchases, REPURCHASE_HREF } from "@/demo/engine/today-people";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { NotifyActions } from "../customers/NotifyActions";
import { profileHref } from "../customers/Reminders";

/**
 * "Avisarles" desde Hoy (R4a): los clientes a los que se les terminó o se les termina el pote esta semana, cada uno
 * con su aviso por email o WhatsApp (el mismo de la ficha: queda anotado y no se repite). Los avisados quedan con su
 * tilde mientras el panel está abierto; al cerrarlo, la fila de Hoy ya no los cuenta.
 */
export function RepurchaseSheet({ keys, snapshot, onClose }: { keys: string[] | null; snapshot: TodaySnapshot; onClose: () => void }) {
  const items = keys ? dueRepurchases(snapshot, DEMO_TODAY).filter((i) => keys.includes(`${i.email}|${i.key}`)) : [];
  const done = items.length > 0 && items.every((i) => i.notified);
  return (
    <Sheet open={!!keys} onClose={onClose} title="Avisos de recompra" labelledBy="avisos-titulo" side="right" className="max-w-lg bg-bg">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 pt-6 sm:p-6">
        <div className="pr-12">
          <p className="eyebrow text-volt-ink">Hoy en tu tienda</p>
          <h2 id="avisos-titulo" className="font-display mt-1 text-3xl">Avisos de recompra</h2>
          <p className="mt-1 text-sm text-muted">El mensaje ya está escrito con su nombre y su producto. La demo no manda nada: el email queda en la bandeja de salida y el WhatsApp se abre para que lo mandes vos.</p>
        </div>
        {done && (
          <p role="status" className="flex items-center gap-2 rounded-sm bg-success-soft p-3 text-sm font-bold text-success">
            <CheckCheck size={18} aria-hidden="true" />Listo: les avisaste a todos.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {items.map((i) => (
            <li key={`${i.email}|${i.key}`} className="plate flex flex-col gap-3 rounded-sm border border-line p-4">
              <div className="min-w-0">
                <Link href={profileHref(i.email)} className="font-bold hover:underline">{i.name}</Link>
                <p className="text-sm text-muted">{i.product} · {i.variant}</p>
                <p className={i.inDays < 0 ? "text-sm font-bold text-danger" : "text-sm font-bold"}>{runOutLine(i)}</p>
              </div>
              <NotifyActions item={i} />
            </li>
          ))}
        </ul>
        <Link href={REPURCHASE_HREF} className="text-sm font-bold text-primary underline">Ver todos en Clientes</Link>
      </div>
    </Sheet>
  );
}
