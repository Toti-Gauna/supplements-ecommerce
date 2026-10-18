import { seasonalThemes } from "../fixtures/themes";
import type { SeasonalTheme, SeasonId } from "../types";
import type { AdminData } from "./defaults";

/**
 * Lo que traían de muestra los días del deporte en R3a (y Vuelta al gym, que se corre a marzo para no pisarse con el
 * Open). Si lo guardado sigue igual, el dueño no lo tocó y pasa a lo nuevo; si lo cambió, se respeta lo suyo.
 */
export const PRE_REAL_DATES: Partial<Record<SeasonId, { range: [string, string]; subtitle?: string }>> = {
  "vuelta-al-gym": { range: ["2027-02-15", "2027-02-28"] },
  "crossfit-open": { range: ["2027-03-01", "2027-03-20"], subtitle: "Creatina, pre, muñequeras y soga para dejar todo en el Open." },
  "dia-actividad-fisica": { range: ["2027-04-01", "2027-04-07"] },
  "dia-del-futbolista": { range: ["2027-05-13", "2027-05-16"], subtitle: "Sales, geles y aminoácidos para el partido del domingo y el entrenamiento del martes." },
  "dia-del-running": { range: ["2027-06-01", "2027-06-05"], subtitle: "Geles, sales y magnesio para sumar kilómetros sin calambres." },
  "dia-del-boxeador": { range: ["2027-09-10", "2027-09-15"] },
};

/**
 * v18 (ajustes de R3): fechas reales de los días del deporte (CrossFit Open 18/2–8/3, Actividad Física 6/4, Running el
 * primer miércoles de junio, Futbolista 22/6 y Boxeador 14/9) y Vuelta al gym en marzo. Mueve solo los rangos que siguen
 * iguales a los de muestra (y su bajada, si tampoco se tocó); lo que el dueño editó queda como está.
 */
export function withRealSportDates(saved: Partial<AdminData>): Partial<AdminData> {
  const data = saved.data;
  if (!data || !Array.isArray(data.themes)) return saved;
  const defaults = new Map(seasonalThemes.map((t) => [t.id, t]));
  const themes = data.themes.map((t): SeasonalTheme => {
    const old = PRE_REAL_DATES[t.id];
    const d = defaults.get(t.id);
    if (!old || !d) return t;
    const untouched = t.startsOn === old.range[0] && t.endsOn === old.range[1];
    if (!untouched) return t;
    // La bajada nueva nombra la fecha: cambia solo si también sigue la de muestra.
    const subtitle = old.subtitle && t.subtitle === old.subtitle ? d.subtitle : t.subtitle;
    return { ...t, startsOn: d.startsOn, endsOn: d.endsOn, subtitle };
  });
  return { ...saved, data: { ...data, themes } };
}
