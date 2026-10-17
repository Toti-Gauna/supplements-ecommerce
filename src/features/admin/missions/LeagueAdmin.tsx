"use client";
import { Badge } from "@/components/atoms/Badge";
import { TRAINING_MISSIONS } from "@/demo/fixtures/club";
import { GYM_KIND_LABEL, LEAGUE_PRIZE } from "@/demo/fixtures/gyms";
import { useClubState } from "@/features/club/useClubState";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { MISSIONS_SECTION } from "./MissionsAdmin";

const TH = "px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted";

/**
 * Liga de gimnasios en el panel (R2c), solo lectura: la tabla del mes con socios y puntos (muestra más la cuenta demo
 * si eligió box), el premio del ganador y las misiones de entrenamiento que alimentan los puntos.
 */
export function LeagueAdmin() {
  const { league } = useClubState();
  const leader = league[0]?.points ?? 0;
  return (
    <>
      <SubpageHeader trail={[MARKETING, MISSIONS_SECTION]} back={MISSIONS_SECTION} title="Liga de gimnasios"
        intro="Solo lectura. Los puntos salen de pedidos pagados, misiones y Shaker Rush de los clientes de cada box." />
      {/* La tabla se desplaza de costado en el celular: la región se puede enfocar para moverla con el teclado. */}
      <div role="region" aria-label="Ranking del mes por gimnasio" tabIndex={0} className="mb-6 overflow-x-auto rounded-sm border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">Ranking del mes por gimnasio</caption>
          <thead className="border-b border-line bg-accent/40">
            <tr><th scope="col" className={TH}>Puesto</th><th scope="col" className={TH}>Gimnasio</th><th scope="col" className={TH}>Tipo</th><th scope="col" className={`${TH} text-right`}>Clientes</th><th scope="col" className={`${TH} text-right`}>Puntos del mes</th><th scope="col" className={`${TH} text-right`}>Al líder</th></tr>
          </thead>
          <tbody>
            {league.map((r) => (
              <tr key={r.gym.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2.5 font-lab font-bold tabular-nums">{r.position}.º</td>
                <td className="px-3 py-2.5"><span className="font-bold">{r.gym.name}</span> <span className="text-muted">· {r.gym.barrio}</span>{r.mine && <Badge tone="brand" className="ml-2">Cuenta demo +{r.contribution}</Badge>}</td>
                <td className="px-3 py-2.5 text-muted">{GYM_KIND_LABEL[r.gym.kind]}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{r.gym.members + (r.mine ? 1 : 0)}</td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums">{r.points.toLocaleString("es-AR")}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-muted">{r.position === 1 ? "—" : `−${(leader - r.points).toLocaleString("es-AR")}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="liga-premio" className="rounded-sm border border-line bg-surface p-4">
          <h2 id="liga-premio" className="font-extrabold">Premio del box ganador</h2>
          <p className="mt-1 text-sm text-muted">{LEAGUE_PRIZE}</p>
        </section>
        <section aria-labelledby="liga-misiones" className="rounded-sm border border-line bg-surface p-4">
          <h2 id="liga-misiones" className="font-extrabold">Misiones de entrenamiento</h2>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {TRAINING_MISSIONS.map((m) => <li key={m.id}><strong>{m.title}</strong> <span className="text-muted">· {m.reward} · +{m.points} pts · {m.period === "week" ? "una vez por semana" : "una sola vez"}</span></li>)}
          </ul>
        </section>
      </div>
    </>
  );
}
