"use client";
import { Badge } from "@/components/atoms/Badge";
import type { AdminUser } from "@/demo/admin/types";
import type { Mission } from "@/demo/types";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { Panel } from "../detail/Panel";
import { brand } from "@/config/brand";

const amount = (m: Mission, n: number) => (m.type === "SPEND_TOTAL" ? formatARS(n) : String(n));

/** Misiones y premios del Club (8.3.12): progreso guardado del cliente y sus premios, sin inventar datos. */
export function ClubCard({ user, missions }: { user?: AdminUser; missions: Mission[] }) {
  if (!user) return <Panel title={brand.club}><p className="text-sm text-muted">Compró como invitado: sin cuenta no suma misiones ni premios.</p></Panel>;
  const progress = missions.filter((m) => m.id in user.missionProgress);
  return (
    <Panel title={brand.club}>
      <h3 className="mb-2 text-sm font-bold">Misiones</h3>
      {progress.length ? (
        <ul className="mb-4 flex flex-col gap-2">
          {progress.map((m) => {
            const n = user.missionProgress[m.id] ?? 0;
            const done = n >= m.threshold;
            return (
              <li key={m.id} className="rounded-2xl bg-bg p-3 text-sm">
                <span className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold">{m.title}</span><Badge tone={done ? "success" : "neutral"}>{done ? "Completada" : "En curso"}</Badge></span>
                <span className="mt-1 block text-muted">{amount(m, Math.min(n, m.threshold))} de {amount(m, m.threshold)} · premio: {m.reward}</span>
                <span aria-hidden="true" className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((n / m.threshold) * 100))}%` }} /></span>
              </li>
            );
          })}
        </ul>
      ) : <p className="mb-4 text-sm text-muted">Todavía no avanzó en ninguna misión.</p>}
      <h3 className="mb-2 text-sm font-bold">Premios</h3>
      {user.rewards.length ? (
        <ul className="flex flex-col gap-2">
          {user.rewards.map((r) => (
            <li key={r.title + r.expiresAt} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-bg p-3 text-sm">
              <span><span className="block font-bold">{r.title}</span><span className="text-muted">Vence el {formatDate(r.expiresAt)}</span></span>
              <Badge tone={r.used ? "neutral" : "success"}>{r.used ? "Usado" : "Disponible"}</Badge>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted">Sin premios.</p>}
    </Panel>
  );
}
