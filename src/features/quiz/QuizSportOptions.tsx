"use client";
import type { CSSProperties } from "react";
import { AthleteSilhouette } from "@/components/illustrations/AthleteSilhouette";
import { SportArt } from "@/components/illustrations/SportArt";
import { sports, type SportInfo } from "@/demo/fixtures/sports";
import type { SportId } from "@/demo/types";
import { cn } from "@/lib/cn";
import { CHOICE_CARD, CHOICE_INPUT, CHOICE_ON, ChoiceMark, QuizChoice } from "./QuizChoice";

interface Props {
  /** undefined: sin contestar; null: "Solo gimnasio". */
  value: SportId | null | undefined;
  onChange: (sport: SportId | null) => void;
}

/** Ficha de un deporte: el dibujo en su color arriba, el nombre y una línea de qué pide. Radio nativo a toda la ficha. */
function SportTile({ sport, checked, onPick }: { sport: SportInfo; checked: boolean; onPick: () => void }) {
  return (
    <label style={{ "--hue": sport.hue } as CSSProperties} data-sport-option={sport.id}
      className={cn(CHOICE_CARD, "flex min-w-0 flex-col gap-2 p-2.5 sm:p-3", checked && CHOICE_ON)}>
      <input type="radio" name="sport" value={sport.id} checked={checked} onChange={onPick} className={CHOICE_INPUT} />
      <span aria-hidden="true"
        className="relative grid h-24 place-items-center overflow-hidden rounded-sm bg-[radial-gradient(70%_70%_at_50%_100%,color-mix(in_oklab,var(--hue)_22%,transparent),transparent_75%)] text-[color:var(--hue)] ring-1 ring-white/[0.06] sm:h-28">
        <SportArt sport={sport.id} className="h-full w-auto py-1.5 drop-shadow-[0_0_10px_color-mix(in_srgb,var(--hue)_40%,transparent)]" />
        <ChoiceMark type="radio" checked={checked} className={cn("absolute right-1.5 top-1.5", !checked && "bg-night/60")} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 px-0.5">
        <span className="font-bold leading-tight text-on-night">{sport.name}</span>
        <span className="line-clamp-2 text-[12px] leading-snug text-night-muted">{sport.pitch}</span>
      </span>
    </label>
  );
}

/**
 * Deporte: "Solo gimnasio" arriba (arma con los objetivos) y la grilla de los doce deportes con su dibujo. Un solo
 * grupo de radios: flechas para moverse, como siempre.
 */
export function QuizSportOptions({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <QuizChoice type="radio" name="sport" value="gimnasio" checked={value === null} onChange={() => onChange(null)} className="col-span-full"
        icon={<AthleteSilhouette goal="fuerza" className="h-9 w-auto" />} title="Solo gimnasio" description="Armamos con tus objetivos, sin deporte" />
      {sports.map((s) => <SportTile key={s.id} sport={s} checked={value === s.id} onPick={() => onChange(s.id)} />)}
    </div>
  );
}
