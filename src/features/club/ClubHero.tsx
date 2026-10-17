"use client";
import { ArrowDown, Sparkles } from "lucide-react";
import { ClubMedal } from "@/components/illustrations/ClubMedal";
import { brand } from "@/config/brand";
import { TRAINING_MISSIONS } from "@/demo/fixtures/club";
import { GYMS } from "@/demo/fixtures/gyms";
import { useCurrentTheme } from "@/features/themes/useCurrentTheme";
import { ClubNextPrize } from "./ClubNextPrize";
import { DemoAccountButton } from "./DemoAccountButton";
import { NightStats, type NightStat } from "./NightStats";
import { NIGHT_BAND } from "./styles";
import type { ClubState } from "./useClubState";

/** El marcador de la portada: con cuenta, lo tuyo; sin cuenta, lo que ofrece el Club (nunca un "0 %" como dato). */
function heroStats(s: ClubState): NightStat[] {
  if (!s.signedIn) {
    const missions = s.purchase.length + TRAINING_MISSIONS.length;
    return [
      { label: "Misiones", value: String(missions), reading: `${missions} misiones activas` },
      { label: "Gimnasios en la liga", value: String(GYMS.length), reading: `${GYMS.length} gimnasios en la liga` },
      { label: "Niveles", value: "4", reading: "4 niveles: bronce, plata, oro y platino" },
    ];
  }
  const mine = s.league.find((r) => r.mine);
  return [
    { label: "Tus puntos del mes", value: String(s.points.total), reading: `${s.points.total} puntos este mes` },
    { label: "Misiones completas", value: String(s.completed), reading: `${s.completed} misiones completas` },
    { label: "Puesto de tu box", value: mine ? String(mine.position) : "-", reading: mine ? `Tu gimnasio va ${mine.position}.º` : "Todavía no elegiste gimnasio", hint: mine ? undefined : "Elegilo en la liga" },
  ];
}

/**
 * Portada del Club: título, tu nivel como medalla, el marcador y "Tu próximo premio". La temática vigente solo tiñe el
 * acento (`--season-accent`). Al invitado lo invita a crear la cuenta demo; nunca le promete un premio.
 */
export function ClubHero({ state }: { state: ClubState }) {
  const { theme } = useCurrentTheme();
  const { signedIn, user, level } = state;
  return (
    <section aria-labelledby="club-title" className={NIGHT_BAND}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand-glow)_40%,transparent),transparent)]" />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="eyebrow animate-rise text-(--season-accent)">{brand.club}{theme ? ` · ${theme.name}` : ""}</p>
          <h1 id="club-title" className="font-display animate-rise mt-4 text-[clamp(2.7rem,6.5vw,5.2rem)] leading-[0.98]" style={{ animationDelay: "120ms" }}>
            Sumá carga. <span className="italic text-(--season-accent)">Subí de nivel.</span>
          </h1>
          <p className="animate-rise mt-5 max-w-lg text-lg text-night-muted" style={{ animationDelay: "220ms" }}>
            Misiones de compra y de entrenamiento, la liga de gimnasios de {brand.city} y premios en producto.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
            {signedIn && user ? (
              <span className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-white/10 py-1 pl-2 pr-5 text-sm font-bold">
                <ClubMedal metal={level.level.metal} className="h-11 w-9" />
                <span><Sparkles size={14} aria-hidden="true" className="mr-1 inline text-(--season-accent)" />Progreso de {user.name.split(" ")[0]} · Nivel {level.level.name}</span>
              </span>
            ) : (
              <DemoAccountButton size="lg" />
            )}
            <a href="#ruleta" className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-white/25 px-5 font-bold transition-colors hover:bg-white/10">Ir a la ruleta <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <NightStats stats={heroStats(state)} label={signedIn ? "Tu marcador del Club" : "El Club en números"} className="mt-10 max-w-xl" />
        </div>
        <ClubNextPrize ring={state.ring} />
      </div>
    </section>
  );
}
