import { seasonalThemes, themeCoupons } from "../fixtures/themes";
import type { SeasonalTheme, SeasonId } from "../types";
import type { AdminData } from "./defaults";

/**
 * Rangos de muestra ANTERIORES a R3a. Si la temática guardada sigue exactamente así, el dueño no tocó sus fechas y pasa
 * al rango nuevo (más corto, para que ningún día caiga en dos campañas). Si las cambió, se respetan las suyas.
 */
export const PRE_R3A_RANGES: Partial<Record<SeasonId, [string, string]>> = {
  "vuelta-al-gym": ["2027-02-15", "2027-03-15"],
  "dia-del-padre": ["2027-06-01", "2027-06-20"],
  "operacion-verano": ["2027-09-01", "2027-09-30"],
};

/** Marcas fijas del código (no se editan en el panel): siempre las de la versión vigente. */
function withFlags(t: SeasonalTheme, d: SeasonalTheme | undefined): SeasonalTheme {
  const next: SeasonalTheme = { ...t };
  delete next.sport;
  delete next.waitingRoom;
  if (d?.sport) next.sport = true;
  if (d?.waitingRoom) next.waitingRoom = true;
  return next;
}

/**
 * v15 (R3a, Campañas): suma los cinco días del deporte con sus cupones, acorta los rangos que el dueño no editó y
 * actualiza las marcas de sala de espera y de deporte. Lo que el dueño editó (textos, fechas, cupones, productos) queda.
 */
export function withSportCampaigns(saved: Partial<AdminData>): Partial<AdminData> {
  const data = saved.data;
  if (!data || !Array.isArray(data.themes)) return saved;
  const defaults = new Map(seasonalThemes.map((t) => [t.id, t]));
  const themes = data.themes.map((t) => {
    const d = defaults.get(t.id);
    const old = PRE_R3A_RANGES[t.id];
    const untouched = d && old && t.startsOn === old[0] && t.endsOn === old[1];
    return withFlags(untouched ? { ...t, startsOn: d.startsOn, endsOn: d.endsOn } : t, d);
  });
  const added = seasonalThemes.filter((d) => !themes.some((t) => t.id === d.id));
  themes.push(...structuredClone(added));
  // Solo los cupones de las campañas que llegan ahora: uno viejo que el dueño borró no vuelve; un código suyo igual no se pisa.
  const coupons = Array.isArray(data.coupons) ? [...data.coupons] : [];
  for (const c of themeCoupons) if (added.some((t) => t.id === c.themeId) && !coupons.some((x) => x.code === c.code)) coupons.push(structuredClone(c));
  return { ...saved, data: { ...data, themes, coupons } };
}
