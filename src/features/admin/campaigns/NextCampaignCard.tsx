"use client";
import Link from "next/link";
import { CalendarClock, Images, Pencil } from "lucide-react";
import { nextCampaign, upcomingCampaign } from "@/demo/admin/campaign-calendar";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDayRange } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { CampaignArt } from "@/components/illustrations/campaigns";
import { skinOf } from "@/features/themes/skins";
import { editorHref, piecesHref } from "./links";

const days = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

/**
 * "Próxima campaña" (Inicio del panel y Campañas): cuánto falta para la próxima fecha, la que está en curso y el atajo
 * al editor y a las piezas para Instagram. Cuenta contra el día de la demo.
 */
export function NextCampaignCard({ className }: { className?: string }) {
  const themes = useAdmin((s) => s.data.themes);
  const live = nextCampaign(themes, DEMO_TODAY);
  const next = upcomingCampaign(themes, DEMO_TODAY);
  if (!next) return null;
  const t = next.theme;
  const skin = skinOf(t.id);
  return (
    <section aria-labelledby="next-campaign" data-next-campaign={t.id} className={`led-dark flex overflow-hidden rounded-sm bg-night text-on-night shadow-[var(--shadow-card)] ${className ?? ""}`}>
      <div aria-hidden="true" className="relative hidden w-28 shrink-0 sm:block" style={{ background: `linear-gradient(160deg, ${skin.from}, ${skin.to})` }}>
        <CampaignArt id={t.id} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <p id="next-campaign" className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-volt"><CalendarClock size={15} aria-hidden="true" />Próxima campaña</p>
        <p className="font-display text-3xl leading-none">{t.name}</p>
        <p className="text-sm text-night-muted">
          {formatDayRange(t.startsOn, t.endsOn)} · <strong className="text-on-night">{next.daysLeft === 0 ? "empieza hoy" : `faltan ${days(next.daysLeft)}`}</strong>
          {live?.live && live.theme.id !== t.id ? ` · en curso: ${live.theme.name} (termina en ${days(live.endsIn)})` : ""}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Link href={editorHref(t.id)} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-volt px-4 text-sm font-bold text-night hover:brightness-105"><Pencil size={15} aria-hidden="true" />Preparar {t.name}</Link>
          <Link href={piecesHref(t.id)} className="inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-sm font-bold text-on-night ring-1 ring-white/25 hover:bg-white/10"><Images size={15} aria-hidden="true" />Sacar las piezas</Link>
        </div>
      </div>
    </section>
  );
}
