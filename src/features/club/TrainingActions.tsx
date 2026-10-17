"use client";
import { Check, Dumbbell, Play } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { ownWeekCheckins } from "@/demo/engine/club-training";
import { weekDays } from "@/demo/engine/club-calendar";
import { sportInfo, sportList } from "@/demo/engine/sports";
import type { TrainingMission } from "@/demo/fixtures/club";
import type { TrainingContext } from "@/demo/engine/club-training";
import type { SportId } from "@/demo/types";
import { cn } from "@/lib/cn";

const DAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];
const DAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** La semana como 7 placas (lunes a domingo): se encienden los días que marcaste; hoy lleva el filo. */
function WeekStrip({ ctx }: { ctx: TrainingContext }) {
  const days = weekDays(ctx.today);
  const done = new Set(ownWeekCheckins(ctx.checkins, ctx.today));
  return (
    <ol aria-label="Tus entrenos de esta semana" className="grid grid-cols-7 gap-1">
      {days.map((d, i) => {
        const on = done.has(d);
        return (
          <li key={d} aria-label={`${DAY_NAMES[i]}: ${on ? "entrenaste" : "sin marcar"}`}
            className={cn("bevel grid h-10 place-items-center rounded-xs border font-mono text-[12px] font-bold", on ? "border-transparent bg-primary text-on-primary" : "border-line bg-accent/50 text-muted", d === ctx.today && "outline outline-2 outline-offset-1 outline-ink/40")}>
            {on ? <Check size={14} aria-hidden="true" /> : DAY_LETTERS[i]}
          </li>
        );
      })}
    </ol>
  );
}

interface Props { mission: TrainingMission; ctx: TrainingContext; onCheckIn: () => void; onSport: (id: SportId) => void }

/** Lo que se hace en cada misión de entrenamiento: marcar el entreno, anotarse a un deporte o jugar. */
export function TrainingActions({ mission, ctx, onCheckIn, onSport }: Props) {
  const [sport, setSport] = useState<SportId>("boxeo");
  if (mission.kind === "CHECKINS_WEEK") {
    const today = ctx.checkins.includes(ctx.today);
    return (
      <div className="flex flex-col gap-3">
        <WeekStrip ctx={ctx} />
        {ctx.seededWeek > 0 && <p className="text-xs text-muted">La cuenta demo ya trae {ctx.seededWeek} entrenos de esta semana.</p>}
        <Button variant="secondary" size="sm" disabled={today} onClick={onCheckIn} className="w-full sm:w-fit">
          {today ? <><Check size={15} aria-hidden="true" />Hoy ya entrenaste</> : <><Dumbbell size={15} aria-hidden="true" />Marcar el entreno de hoy</>}
        </Button>
      </div>
    );
  }
  if (mission.kind === "SPORT_DAY") {
    if (ctx.sportTried) return <p className="flex items-center gap-2 text-sm font-bold"><Check size={16} aria-hidden="true" className="text-success" />Te anotaste: {sportInfo(ctx.sportTried as SportId)?.name ?? ctx.sportTried}</p>;
    return (
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold text-muted">
          Deporte para probar
          <Select value={sport} onChange={(e) => setSport(e.target.value as SportId)} className="min-h-10">
            {sportList().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </label>
        <Button variant="secondary" size="sm" onClick={() => onSport(sport)}>Me anoto</Button>
      </div>
    );
  }
  return (
    <ButtonLink href="/club/juego/" variant="secondary" size="sm" className="w-full sm:w-fit">
      <Play size={15} aria-hidden="true" className="fill-current" />{ctx.gameWeekPlays > 0 ? `Jugaste ${ctx.gameWeekPlays} ${ctx.gameWeekPlays === 1 ? "partida" : "partidas"}` : "Jugar Shaker Rush"}
    </ButtonLink>
  );
}
