"use client";
import { ArrowDown, Gift, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/atoms/Button";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { Counter } from "@/components/motion/Counter";
import { ProgressRing } from "@/components/molecules/ProgressRing";
import { formatMissionValue, previewMission } from "@/demo/engine/missions";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import type { Mission } from "@/demo/types";
import { skinOf } from "@/features/themes/skins";
import { useCurrentTheme } from "@/features/themes/useCurrentTheme";
import { useAccount } from "@/stores/account";

const DEMO_USER = { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" };

/**
 * Portada del Club (8.2.13): título, métricas, el próximo premio y los accesos. Toma el acento y el adorno de la
 * temática vigente; en Original queda el dorado de Volta. El progreso sale del motor de misiones, sin cambios.
 */
export function ClubHero({ missions, done }: { missions: Mission[]; done: number }) {
  const { user, login } = useAccount();
  const { theme } = useCurrentTheme();
  const skin = theme ? skinOf(theme.id) : null;
  const accent = skin?.accent ?? "#d2ad69";
  // Próximo premio: la misión más avanzada que falta completar (sin cuenta, todas arrancan en cero).
  const next = missions
    .map((m) => previewMission(m, user ? (demoAccountProgress[m.id] ?? 0) : 0, { units: 0, total: 0 }))
    .filter((p) => !p.alreadyComplete)
    .sort((a, b) => b.pctAfter - a.pctAfter)[0];
  const metrics = [
    { label: "Misiones activas", value: missions.length },
    { label: "Completadas (demo)", value: done },
    { label: "Premios en producto", value: missions.length },
  ];
  return (
    <section aria-labelledby="club-title" style={{ "--club-accent": accent } as CSSProperties}
      className="relative overflow-hidden rounded-[2rem] bg-night px-6 py-10 text-[#f6f1e8] sm:rounded-[2.5rem] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--club-accent)_30%,transparent),transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.06),transparent)]" />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14">
        <div>
          <p className="eyebrow animate-rise text-[color:var(--club-accent)]">Club Volta{theme ? ` · ${theme.name}` : ""}</p>
          <h1 id="club-title" className="font-display animate-rise mt-4 text-[clamp(2.7rem,6.5vw,5.2rem)] leading-[0.98]" style={{ animationDelay: "120ms" }}>
            Comprás, sumás, <span className="italic text-[color:var(--club-accent)]">ganás.</span>
          </h1>
          <p className="animate-rise mt-5 max-w-lg text-lg text-[#cfc6b3]" style={{ animationDelay: "220ms" }}>Misiones simples, premios en producto y una ruleta para tu próxima compra.</p>
          <div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
            {user ? (
              <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-bold"><Sparkles size={16} aria-hidden="true" className="text-[color:var(--club-accent)]" /> Progreso de {user.name.split(" ")[0]}</span>
            ) : (
              <Button variant="light" size="lg" onClick={() => login(DEMO_USER)} aria-label="Ver mi progreso con la cuenta demo">
                <Sparkles size={18} aria-hidden="true" /> Ver mi progreso<span className="max-sm:hidden"> con la cuenta demo</span>
              </Button>
            )}
            <a href="#ruleta" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-5 font-bold transition-colors hover:bg-white/10">Ir a la ruleta <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col-reverse gap-1 rounded-2xl border border-white/10 bg-white/[0.05] p-3 sm:p-4">
                <dt className="text-[11px] leading-tight text-[#cfc6b3] sm:text-xs">{m.label}</dt>
                <dd className="font-display text-3xl leading-none sm:text-4xl"><Counter value={m.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8">
          <span aria-hidden="true" className="absolute -right-3 -top-5 block h-14 w-14 rotate-12 sm:h-16 sm:w-16">
            {skin ? <Decor kind={skin.topper} className="h-full w-full" /> : <span className="grid h-full w-full place-items-center rounded-full bg-[color:var(--club-accent)] text-night"><Gift size={26} /></span>}
          </span>
          <p className="eyebrow text-[color:var(--club-accent)]">Tu próximo premio</p>
          {next ? (
            <div className="mt-5 flex items-center gap-5">
              <ProgressRing pct={next.pctAfter} size={112} stroke={9} tone="brass" label={`Progreso hacia ${next.mission.reward}`}>
                <span className="font-display text-3xl tabular-nums">{next.pctAfter}%</span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="font-display text-2xl leading-tight sm:text-3xl">{next.mission.reward}</p>
                <p className="mt-1 text-sm text-[#cfc6b3]">{next.mission.title} · {formatMissionValue(next.mission, next.after)} de {formatMissionValue(next.mission, next.mission.threshold)}</p>
              </div>
            </div>
          ) : (
            <p className="font-display mt-4 text-2xl">¡Completaste todas las misiones!</p>
          )}
          <p className="mt-6 border-t border-white/10 pt-4 text-xs text-[#cfc6b3]">{user ? "Progreso de ejemplo de la cuenta demo." : "Sin cuenta el progreso arranca en cero."}</p>
        </div>
      </div>
    </section>
  );
}
