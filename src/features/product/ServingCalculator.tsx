"use client";
import { BellRing, Check } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { creatineGrams, PROTEIN_PER_KG, proteinFromLabel, proteinPlan, WEIGHT_RANGE } from "@/demo/engine/dose";
import { daysLasting, reminderOn, runsOutOn } from "@/demo/engine/servings";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useGoals } from "../catalog/useGoals";
import type { Goal, Product, Variant } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/date";
import { useReminders } from "@/stores/reminders";
import { useToasts } from "@/stores/toast";

const field = "min-h-11 w-full rounded-sm border border-line bg-bg px-3 font-lab text-base text-ink";

/**
 * "¿Cuánto te dura?": servicios por día → días y fecha en que se termina, con aviso de recompra. Para proteínas suma
 * la proteína del día según peso y objetivo; para creatinas, la dosis de referencia por peso. Todo ORIENTATIVO.
 */
export function ServingCalculator({ product, variant }: { product: Product; variant: Variant }) {
  const id = useId();
  const [perDay, setPerDay] = useState(1);
  const [weight, setWeight] = useState(75);
  const goals = (product.goals ?? []).filter((g) => PROTEIN_PER_KG[g]);
  const [goal, setGoal] = useState<Goal>(goals[0] ?? "masa-muscular");
  const info = useGoals();
  const reminders = useReminders((s) => s.items);
  const save = useReminders((s) => s.save);
  const push = useToasts((s) => s.push);
  const servings = variant.servings ?? 0;
  if (servings < 2) return null;
  const days = daysLasting(servings, perDay);
  const end = runsOutOn(DEMO_TODAY, days);
  const remind = reminderOn(DEMO_TODAY, days);
  const reminderId = `${product.slug}:${variant.id}`;
  const saved = reminders.some((r) => r.id === reminderId && r.perDay === perDay);
  const protein = product.categorySlug === "proteinas" || product.categorySlug === "ganadores" ? proteinFromLabel(product.nutrition?.rows) : null;
  const creatine = product.categorySlug === "creatinas";
  const plan = protein ? proteinPlan(weight, goal, protein * perDay) : null;
  const onRemind = () => {
    save({ id: reminderId, slug: product.slug, variantId: variant.id, name: product.name, variant: variant.label, startsOn: DEMO_TODAY, runsOutOn: end, remindOn: remind, perDay });
    push({ tone: "success", title: "Te avisamos antes de que se termine", description: `Aviso de muestra para el ${formatDay(remind, "long")}.`, action: { label: "Ver en Mi cuenta", href: "/cuenta/#recompras" } });
  };
  return (
    <section aria-labelledby={`${id}-t`} className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <p className="eyebrow text-volt-ink">Calculadora</p>
      <h2 id={`${id}-t`} className="font-display mt-1 text-2xl">¿Cuánto te dura?</h2>
      <fieldset className="mt-4">
        <legend className="text-sm font-bold">Servicios por día</legend>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" onClick={() => setPerDay(n)} aria-pressed={perDay === n}
              className={cn("min-h-11 flex-1 rounded-sm border font-lab text-sm font-bold transition-colors", perDay === n ? "border-primary bg-primary text-on-primary" : "border-line hover:border-ink/30")}>{n} por día</button>
          ))}
        </div>
      </fieldset>
      {(protein || creatine) && (
        <div className="mt-4 grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] gap-3">
          <label className="flex flex-col gap-1 text-sm font-bold">Tu peso (kg)
            <input type="number" inputMode="numeric" min={WEIGHT_RANGE.min} max={WEIGHT_RANGE.max} value={weight} onChange={(e) => setWeight(Number(e.target.value) || WEIGHT_RANGE.min)} className={field} />
          </label>
          {protein && goals.length > 0 && (
            <label className="flex flex-col gap-1 text-sm font-bold">Objetivo
              <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className={field}>{goals.map((g) => <option key={g} value={g}>{info.find((x) => x.id === g)?.name}</option>)}</select>
            </label>
          )}
        </div>
      )}
      <div className="mt-5 rounded-sm bg-night p-4 text-on-night">
        <div className="flex items-end justify-between gap-3">
          <p><span className="font-display font-wide text-4xl text-volt">{days}</span> <span className="font-bold">días</span></p>
          <p className="text-right text-xs text-night-muted">{servings} servicios<br />se termina el {formatDay(end, "dayMonth")}</p>
        </div>
        <BatteryMeter pct={100} label={`Envase de ${servings} servicios: dura ${days} días`} className="mt-3 border-white/15" />
        {plan && <p className="mt-3 text-sm text-night-muted">Tu proteína del día: <strong className="text-on-night">{plan.dayMin} a {plan.dayMax} g</strong>. {perDay > 1 ? `${perDay} servicios suman` : "Un servicio suma"} {protein! * perDay} g, el {plan.servingShare} % del mínimo.</p>}
        {creatine && <p className="mt-3 text-sm text-night-muted">Referencia para {Math.round(weight)} kg: <strong className="text-on-night">{creatineGrams(weight).toLocaleString("es-AR")} g de creatina por día</strong>, todos los días.</p>}
      </div>
      {saved ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-bold text-success"><Check size={18} aria-hidden="true" /> Te avisamos el {formatDay(remind, "dayMonth")}. <Link href="/cuenta/#recompras" className="text-primary underline">Ver avisos</Link></p>
      ) : (
        <Button variant="secondary" onClick={onRemind} className="mt-4 w-full"><BellRing size={18} aria-hidden="true" className="text-volt-ink" />Avisame antes de que se termine</Button>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-muted">El aviso llega 5 días antes. Cálculo orientativo para personas sanas que entrenan, con fecha de referencia de la demo. No reemplaza la consulta con un profesional.</p>
    </section>
  );
}
