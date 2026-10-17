"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { shopNow } from "@/demo/clock";
import { daysLeftText, daysUntil } from "@/demo/engine/campaign-window";
import { cn } from "@/lib/cn";
import { seasonAccentVariables } from "../themes/palettes";
import { useCampaignAgenda } from "./useCampaignAgenda";
import s from "./campaign.module.css";

/**
 * Franja "Próxima campaña" (R3a, plan §10): entre fechas y en modo automático, una línea fina arriba del inicio con la
 * campaña que viene y cuánto falta, que lleva a su página (/campana/). Con la sala de espera abierta lo dice. En modo
 * "off", con una temática puesta o en vista previa no aparece.
 */
export function NextCampaignStrip({ className }: { className?: string }) {
  const agenda = useCampaignAgenda();
  if (!agenda || agenda.live || !agenda.next) return null;
  const { theme, window: win } = agenda.next;
  const left = daysLeftText(daysUntil(win.startsAt, shopNow()));
  const waiting = win.state === "waiting";
  return (
    <Link href={`/campana/?id=${theme.id}`} data-next-campaign={theme.id} style={seasonAccentVariables(theme.id) as CSSProperties}
      className={cn("group flex min-h-11 items-center gap-3 border-b border-line bg-night px-4 py-2 text-on-night sm:px-6", className)}>
      <span aria-hidden="true" className="h-4 w-1.5 shrink-0 -skew-x-12 bg-(--season-accent) shadow-[0_0_10px_var(--season-glow)]" />
      <span className={cn(s.mono, "min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.12em]")}>
        <span className="text-night-muted">{waiting ? "Sala de espera abierta · " : "Se viene "}</span>
        {theme.name} <span className="text-night-muted">· {left}</span>
      </span>
      <span className={cn(s.mono, "flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] underline decoration-(--season-accent) underline-offset-4 group-hover:text-(--season-accent)")}>
        {waiting ? "Entrar" : "Ver"} <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}
