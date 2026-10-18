"use client";
import Link from "next/link";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { dayKeyOf } from "@/demo/engine/campaign-window";
import { themeOffer } from "@/demo/engine/themes";
import type { SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/date";
import { useUrlSearch } from "@/lib/useUrlSearch";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { useEffectivePreview } from "@/stores/themePreview";
import { OwnerSpot } from "../owner/OwnerSpot";
import { ThemeOffersRail } from "../themes/ThemeOffersRail";
import { CampaignCalendar } from "./CampaignCalendar";
import { CampaignDrop } from "./CampaignDrop";
import { useCampaignWindow, type CampaignPhase } from "./useCampaignWindow";
import { WaitingLead } from "./WaitingLead";

const PHASES: Record<string, CampaignPhase> = { espera: "waiting", vivo: "live" };
const CHIP = "inline-flex min-h-11 items-center border px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em]";

/** Una campaña según su momento: en vivo (drop y productos), sala de espera o por venir, o terminada. */
function CampaignDetail({ theme, phase }: { theme: SeasonalTheme; phase: CampaignPhase | null }) {
  const { win } = useCampaignWindow(theme, phase);
  const offer = themeOffer(theme);
  if (win.state === "live") {
    return (
      <div className="flex flex-col gap-12">
        <CampaignDrop theme={theme} offer={offer} phase={phase} variant="page" />
        <div className="px-4 sm:px-6"><ThemeOffersRail theme={theme} offer={offer} /></div>
      </div>
    );
  }
  if (win.state === "ended") {
    return (
      <section aria-labelledby="terminada" className="mx-4 rounded-sm bg-night p-6 text-on-night sm:mx-6 sm:p-10">
        <p className="eyebrow text-night-muted">Campaña terminada</p>
        <h1 id="terminada" className="font-display mt-2 text-5xl">{theme.name} ya terminó</h1>
        <p className="mt-2 text-night-muted">Vuelve el {formatDay(dayKeyOf(win.nextStartsAt), "long")}. Mientras tanto, el catálogo sigue abierto.</p>
        <Link href="/categorias/" className="mt-5 inline-flex min-h-11 items-center font-bold text-volt underline underline-offset-4">Ver el catálogo</Link>
      </section>
    );
  }
  return <WaitingLead theme={theme} phase={phase} variant="page" />;
}

/**
 * /campana/?id=… (R3a): la página de una campaña, a la que lleva la franja "Próxima campaña". Sin id, el calendario.
 * Para la demo, `&fase=espera` simula la sala de espera y `&fase=vivo` el primer día (también la vista previa de
 * "Probar temáticas" la muestra en vivo). Estático: la campaña se lee de la URL al hidratar.
 */
export function CampaignPage() {
  const [search, replace] = useUrlSearch();
  const hydrated = useHydrated();
  const themes = useDemoData((d) => d.themes);
  const preview = useEffectivePreview();
  if (!hydrated) return <HeroSkeleton label="Cargando campaña" />;
  const params = new URLSearchParams(search);
  const theme = themes.find((t) => t.id === params.get("id") && t.active);
  if (!theme) return <><OwnerSpot id="campana" /><CampaignCalendar themes={themes} /></>;
  const forced = PHASES[params.get("fase") ?? ""] ?? null;
  const phase = forced ?? (preview === theme.id ? "live" : null);
  const show = (fase: string | null) => replace(fase ? `id=${theme.id}&fase=${fase}` : `id=${theme.id}`);
  return (
    <div className="-mx-4 -mt-6 flex flex-col gap-8 sm:-mx-6 sm:-mt-10">
      <OwnerSpot id="campana" ctx={{ campaignId: theme.id }} className="px-4 sm:px-6" />
      <CampaignDetail key={`${theme.id}-${phase}`} theme={theme} phase={phase} />
      <nav aria-label="Demostración de la campaña" className="mx-4 flex flex-wrap items-center gap-2 border border-dashed border-ink/20 p-3 sm:mx-6">
        <p className="mr-2 text-sm text-muted">Demostración · ver esta campaña:</p>
        {([["espera", theme.waitingRoom ? "En sala de espera" : "Antes de abrir"], ["vivo", "En vivo"], [null, "Hoy"]] as const).map(([fase, label]) => (
          <button key={label} type="button" onClick={() => show(fase)} aria-pressed={(params.get("fase") ?? null) === fase}
            className={cn(CHIP, (params.get("fase") ?? null) === fase ? "border-ink bg-ink text-bg" : "border-line text-ink hover:border-ink/50")}>{label}</button>
        ))}
        <Link href="/campana/" className={cn(CHIP, "border-transparent text-volt-ink underline underline-offset-4")}>Calendario</Link>
      </nav>
    </div>
  );
}
