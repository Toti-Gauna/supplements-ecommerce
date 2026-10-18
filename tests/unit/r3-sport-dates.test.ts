import { describe, expect, it } from "vitest";
import { overlapsWith } from "@/demo/admin/campaign-calendar";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { migrateAdminData } from "@/demo/admin/migrate";
import { PRE_REAL_DATES, withRealSportDates } from "@/demo/admin/migrate-sport-dates";
import { themeForDate } from "@/demo/engine/themes";
import { seasonalThemes } from "@/demo/fixtures/themes";
import type { SeasonalTheme } from "@/demo/types";
import { ADMIN_STORE_VERSION } from "@/stores/storage";

const theme = (id: string) => seasonalThemes.find((t) => t.id === id)!;
const at = (day: string) => new Date(`${day}T12:00:00`);
const on = (day: string) => themeForDate(seasonalThemes, at(day))?.id ?? null;

/** Un panel guardado en v17: las fechas de muestra de R3a (las viejas) en los días del deporte y en Vuelta al gym. */
function savedV17(edit: (themes: SeasonalTheme[]) => SeasonalTheme[] = (t) => t): AdminData {
  const base = defaultAdminData();
  const themes = base.data.themes.map((t) => {
    const old = PRE_REAL_DATES[t.id];
    return old ? { ...t, startsOn: old.range[0], endsOn: old.range[1], subtitle: old.subtitle ?? t.subtitle } : t;
  });
  return { ...base, data: { ...base.data, themes: edit(themes) } };
}

describe("fechas reales de los días del deporte (2027)", () => {
  it("cada día cae en su fecha real", () => {
    expect([theme("crossfit-open").startsOn, theme("crossfit-open").endsOn]).toEqual(["2027-02-18", "2027-03-08"]);
    expect(theme("dia-actividad-fisica").endsOn).toBe("2027-04-06");
    expect(theme("dia-del-running").endsOn).toBe("2027-06-02");
    expect(new Date(2027, 5, 2).getDay()).toBe(3); // primer miércoles de junio de 2027
    expect(theme("dia-del-futbolista").endsOn).toBe("2027-06-22");
    expect(theme("dia-del-boxeador").endsOn).toBe("2027-09-14");
    expect(["2027-02-18", "2027-03-08", "2027-04-06", "2027-06-02", "2027-06-22", "2027-09-14"].map(on))
      .toEqual(["crossfit-open", "crossfit-open", "dia-actividad-fisica", "dia-del-running", "dia-del-futbolista", "dia-del-boxeador"]);
  });

  it("el Futbolista no se pisa con el Día del Padre ni Vuelta al gym con el Open", () => {
    expect(on("2027-06-20")).toBe("dia-del-padre");
    expect(on("2027-06-21")).toBe("dia-del-futbolista");
    expect(on("2027-03-09")).toBe("vuelta-al-gym");
    for (const t of seasonalThemes) expect(overlapsWith(t, seasonalThemes)).toEqual([]);
  });

  it("las bajadas nombran la fecha", () => {
    expect(theme("dia-del-futbolista").subtitle).toMatch(/22 de junio/);
    expect(theme("dia-del-running").subtitle).toMatch(/primer miércoles de junio/);
    expect(theme("dia-del-boxeador").subtitle).toMatch(/14 de septiembre/);
    expect(theme("dia-actividad-fisica").subtitle).toMatch(/6 de abril/);
  });
});

describe("v18: un panel guardado pasa a las fechas reales", () => {
  it("la versión del panel sube a 18 (o más)", () => {
    expect(ADMIN_STORE_VERSION).toBeGreaterThanOrEqual(18);
  });

  it("mueve los rangos (y las bajadas) que el dueño no tocó", () => {
    const out = withRealSportDates(savedV17()).data!;
    for (const id of Object.keys(PRE_REAL_DATES)) {
      const t = out.themes.find((x) => x.id === id)!;
      expect([t.startsOn, t.endsOn, t.subtitle], id).toEqual([theme(id).startsOn, theme(id).endsOn, theme(id).subtitle]);
    }
  });

  it("respeta lo que editó el dueño: fechas y bajadas propias", () => {
    const saved = savedV17((themes) => themes.map((t) =>
      t.id === "dia-del-futbolista" ? { ...t, startsOn: "2027-05-14", endsOn: "2027-05-14" }
        : t.id === "dia-del-running" ? { ...t, subtitle: "Mi bajada" } : t));
    const out = withRealSportDates(saved).data!;
    const futbol = out.themes.find((t) => t.id === "dia-del-futbolista")!;
    expect([futbol.startsOn, futbol.endsOn]).toEqual(["2027-05-14", "2027-05-14"]);
    expect(futbol.subtitle).toBe(PRE_REAL_DATES["dia-del-futbolista"]!.subtitle);
    const running = out.themes.find((t) => t.id === "dia-del-running")!;
    expect([running.startsOn, running.subtitle]).toEqual(["2027-05-31", "Mi bajada"]);
    // Lo que no es de esta migración no cambia.
    expect(out.themes.find((t) => t.id === "black-friday")).toEqual(theme("black-friday"));
  });

  it("migrateAdminData corre v17 → v18 una sola vez", () => {
    const out = migrateAdminData(savedV17(), 17) as AdminData;
    expect(out.data.themes.find((t) => t.id === "crossfit-open")!.startsOn).toBe("2027-02-18");
    const kept = migrateAdminData(savedV17(), 18) as AdminData;
    expect(kept.data.themes.find((t) => t.id === "crossfit-open")!.startsOn).toBe("2027-03-01");
  });
});
