"use client";
import { useState } from "react";
import type { Nutrition } from "@/demo/types";
import { cn } from "@/lib/cn";

/**
 * Información nutricional con el formato del rótulo argentino: porción, 100 g y %VD, en mono. En el celular se elige
 * la columna (porción o 100 g) para que entre sin achicar la letra. Valores de MUESTRA.
 */
export function NutritionFacts({ nutrition }: { nutrition: Nutrition }) {
  const has100 = nutrition.rows.some((r) => r.per100);
  const [col, setCol] = useState<"serving" | "per100">("serving");
  const tab = (id: typeof col, label: string) => (
    <button type="button" onClick={() => setCol(id)} aria-pressed={col === id}
      className={cn("rounded-sm px-3 py-1.5 text-xs font-bold transition-colors", col === id ? "bg-primary text-on-primary" : "text-muted hover:text-ink")}>{label}</button>
  );
  return (
    <section aria-labelledby="nutri-title" className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-volt-ink">Rótulo</p>
          <h2 id="nutri-title" className="font-display mt-1 text-2xl">Información nutricional</h2>
          <p className="font-lab mt-1 text-sm text-muted">Porción: {nutrition.serving}</p>
        </div>
        {has100 && <div className="flex gap-1 rounded-sm bg-accent p-1 sm:hidden">{tab("serving", "Por porción")}{tab("per100", "Por 100 g")}</div>}
      </div>
      <table className="font-lab mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-y-2 border-ink text-left text-[11px] uppercase tracking-wider text-muted">
            <th scope="col" className="py-2 pr-2 font-bold">Cantidad por porción</th>
            <th scope="col" className={cn("py-2 pr-2 text-right font-bold", has100 && col !== "serving" && "max-sm:hidden")}>Porción</th>
            {has100 && <th scope="col" className={cn("py-2 pr-2 text-right font-bold", col !== "per100" && "max-sm:hidden")}>100 g</th>}
            <th scope="col" className="py-2 text-right font-bold">%VD*</th>
          </tr>
        </thead>
        <tbody>
          {nutrition.rows.map((r) => (
            <tr key={r.label} className="border-b border-line">
              <th scope="row" className={cn("py-2 pr-2 text-left font-semibold", r.sub && "pl-4 font-normal text-muted")}>{r.label}</th>
              <td className={cn("py-2 pr-2 text-right tabular-nums", has100 && col !== "serving" && "max-sm:hidden")}>{r.serving}</td>
              {has100 && <td className={cn("py-2 pr-2 text-right tabular-nums", col !== "per100" && "max-sm:hidden")}>{r.per100 ?? "—"}</td>}
              <td className="py-2 text-right tabular-nums font-bold">{r.dv ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {nutrition.note && <p className="font-lab mt-3 text-xs text-muted">{nutrition.note}</p>}
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        *% Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ. Sus valores diarios pueden ser mayores o menores
        dependiendo de sus necesidades energéticas. Valores de muestra para la demo.
      </p>
      <div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm">
        <p><span className="font-bold">Ingredientes: </span><span className="text-muted">{nutrition.ingredients}</span></p>
        {nutrition.allergens && <p className="font-bold text-warning">{nutrition.allergens}</p>}
        <p className="text-xs text-muted">Suplemento dietario. Consulte a su médico. No utilizar en embarazadas, lactantes ni niños. Mantener fuera del alcance de los niños.</p>
      </div>
    </section>
  );
}
