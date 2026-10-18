"use client";
import { Share2 } from "lucide-react";
import { buttonClass } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { routeText, type RouteStop as Stop } from "@/demo/admin/dispatch";
import type { AdminOrder } from "@/demo/admin/types";
import type { CadeteZone } from "@/demo/fixtures/cadete-zones";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { RouteStop } from "./RouteStop";

interface Props { stops: Stop[]; orders: AdminOrder[]; day: string; today: string; dayText: string }

/** Paradas seguidas de la misma zona, para titular cada tramo con su franja. */
function byZone(stops: Stop[]): { zone: CadeteZone; stops: { stop: Stop; n: number }[] }[] {
  const groups: { zone: CadeteZone; stops: { stop: Stop; n: number }[] }[] = [];
  stops.forEach((stop, i) => {
    const last = groups.at(-1);
    if (last?.zone.id === stop.zone.id) last.stops.push({ stop, n: i + 1 });
    else groups.push({ zone: stop.zone, stops: [{ stop, n: i + 1 }] });
  });
  return groups;
}

/**
 * Hoja de ruta del cadete (R4b): los envíos en Mar del Plata del día, por zona en el orden del recorrido y con su
 * franja. "Mandarle la hoja al cadete" abre WhatsApp con el recorrido escrito (sin destinatario: lo elegís vos).
 */
export function CadeteRoute({ stops, orders, day, today, dayText }: Props) {
  const collect = stops.reduce((s, x) => s + x.toCollect, 0);
  const share = `https://wa.me/?text=${encodeURIComponent(routeText(stops, day, today, brand.name))}`;
  return (
    <section aria-labelledby="hoja-ruta" className="flex min-w-0 flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="hoja-ruta" className="text-lg font-extrabold">Hoja de ruta del cadete</h2>
          <p className="text-sm text-muted">{stops.length ? `${plural(stops.length, "envío", "envíos")} · ${dayText}${collect ? ` · cobrar ${formatARS(collect)}` : " · nada para cobrar"}` : `Sin envíos con cadete · ${dayText}`}</p>
        </div>
        {stops.length > 0 && (
          <a href={share} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "sm")}>
            <Share2 size={15} aria-hidden="true" /> Mandarle la hoja al cadete<span className="sr-only"> por WhatsApp (se abre en otra pestaña)</span>
          </a>
        )}
      </header>
      {stops.length === 0 && <p className="rounded-sm border border-dashed border-ink/15 p-4 text-center text-sm text-muted">Ese día el cadete no tiene envíos. Los retiros y el correo van abajo.</p>}
      {byZone(stops).map((g) => (
        <section key={`${g.zone.id}-${g.stops[0]!.n}`} aria-label={`${g.zone.name}, ${g.zone.window}`} data-zone={g.zone.id}>
          <h3 className="eyebrow mb-1.5 flex flex-wrap gap-x-2 text-muted"><span className="text-ink">{g.zone.name}</span> {g.zone.window}</h3>
          <ol start={g.stops[0]!.n} className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">
            {g.stops.map(({ stop, n }) => <RouteStop key={stop.code} stop={stop} n={n} order={orders.find((o) => o.code === stop.code)!} />)}
          </ol>
        </section>
      ))}
    </section>
  );
}
