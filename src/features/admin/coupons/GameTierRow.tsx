"use client";
import { Trash2 } from "lucide-react";
import { describedBy, Field, Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { GAME_PRIZE_KINDS, GAME_PRIZE_LIMITS, gamePrizeLabel, type TierErrors } from "@/demo/admin/game-prizes";
import type { GamePrizeTier } from "@/demo/fixtures/game";
import type { PrizeKind } from "@/demo/fixtures/wheel";

interface Props {
  tier: GamePrizeTier;
  /** Número de nivel visible (1 = el más fácil). */
  n: number;
  errors?: TierErrors;
  canRemove: boolean;
  onChange: (patch: Partial<GamePrizeTier>) => void;
  onRemove: () => void;
}

const L = GAME_PRIZE_LIMITS;
const toInt = (v: string) => (v === "" ? 0 : Math.round(Number(v)));

/** Un nivel de premio: desde cuántos puntos, qué se gana (tipo y valor) y en cuántos días vence el cupón. */
export function GameTierRow({ tier: t, n, errors: e = {}, canRemove, onChange, onRemove }: Props) {
  const id = (f: string) => `gt-${t.id}-${f}`;
  const valueLabel = t.kind === "PERCENT" ? "Porcentaje" : "Monto en pesos";
  const setKind = (kind: PrizeKind) => onChange({ kind, value: kind === "PERCENT" ? 10 : kind === "FIXED" ? 3000 : 0 });
  return (
    <li className="@container rounded-2xl bg-bg p-3 sm:p-4">
      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="sr-only">Nivel {n}</legend>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="font-lab grid h-8 min-w-8 place-items-center rounded-full bg-accent px-2 text-xs font-bold text-volt-ink">{n}</span>
          <p className="min-w-0 flex-1 font-extrabold">Nivel {n} · <span className="text-muted">{gamePrizeLabel(t.kind, t.value)}</span></p>
          {canRemove && (
            <button type="button" onClick={onRemove} aria-label={`Quitar el nivel ${n}`}
              className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger">
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 @min-[34rem]:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Field id={id("score")} label="Desde (puntos)" error={e.minScore}>
            <Input id={id("score")} type="number" inputMode="numeric" min={L.minScore.min} max={L.minScore.max} step={50} value={t.minScore}
              aria-invalid={!!e.minScore} aria-describedby={describedBy(id("score"), e.minScore)} onChange={(ev) => onChange({ minScore: toInt(ev.target.value) })} />
          </Field>
          <Field id={id("kind")} label="Premio" className="col-span-2 @min-[34rem]:col-span-1">
            <Select id={id("kind")} value={t.kind} onChange={(ev) => setKind(ev.target.value as PrizeKind)}>
              {GAME_PRIZE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </Select>
          </Field>
          {t.kind !== "FREE_SHIPPING" && (
            <Field id={id("value")} label={valueLabel} error={e.value}>
              <Input id={id("value")} type="number" inputMode="numeric" step={t.kind === "PERCENT" ? 1 : 100} value={t.value}
                min={t.kind === "PERCENT" ? L.percent.min : L.fixed.min} max={t.kind === "PERCENT" ? L.percent.max : L.fixed.max}
                aria-invalid={!!e.value} aria-describedby={describedBy(id("value"), e.value)} onChange={(ev) => onChange({ value: toInt(ev.target.value) })} />
            </Field>
          )}
          <Field id={id("days")} label="Vence en (días)" error={e.validDays}>
            <Input id={id("days")} type="number" inputMode="numeric" min={L.validDays.min} max={L.validDays.max} step={1} value={t.validDays}
              aria-invalid={!!e.validDays} aria-describedby={describedBy(id("days"), e.validDays)} onChange={(ev) => onChange({ validDays: toInt(ev.target.value) })} />
          </Field>
        </div>
      </fieldset>
    </li>
  );
}
