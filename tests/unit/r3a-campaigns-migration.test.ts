import { describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { migrateAdminData } from "@/demo/admin/migrate";
import { PRE_R3A_RANGES, withSportCampaigns } from "@/demo/admin/migrate-campaigns";
import { seasonalThemes } from "@/demo/fixtures/themes";
import type { SeasonalTheme } from "@/demo/types";
import { ADMIN_STORE_VERSION } from "@/stores/storage";

const SPORT = ["crossfit-open", "dia-actividad-fisica", "dia-del-futbolista", "dia-del-running", "dia-del-boxeador"];
const SPORT_COUPONS = ["OPEN15", "MOVETE10", "CANCHA15", "KM12", "RING15"];

/** Un panel guardado en v14: 12 fechas con los rangos viejos, sin marcas nuevas y sin los cupones del deporte. */
function savedV14(edit: (themes: SeasonalTheme[]) => SeasonalTheme[] = (t) => t): AdminData {
  const base = defaultAdminData();
  const old = base.data.themes.filter((t) => !t.sport).map((t) => {
    const range = PRE_R3A_RANGES[t.id];
    const copy: SeasonalTheme = { ...t, ...(range ? { startsOn: range[0], endsOn: range[1] } : {}) };
    delete copy.waitingRoom;
    return copy;
  });
  return { ...base, data: { ...base.data, themes: edit(old), coupons: base.data.coupons.filter((c) => !SPORT_COUPONS.includes(c.code)) } };
}

describe("v15: campañas de R3a en un panel guardado", () => {
  it("la versión del panel sube a 15", () => {
    expect(ADMIN_STORE_VERSION).toBe(15);
  });

  it("suma los cinco días del deporte y sus cupones", () => {
    const out = withSportCampaigns(savedV14()).data!;
    expect(out.themes).toHaveLength(17);
    for (const id of SPORT) expect(out.themes.find((t) => t.id === id)?.sport).toBe(true);
    for (const code of SPORT_COUPONS) expect(out.coupons.some((c) => c.code === code)).toBe(true);
  });

  it("acorta los rangos que el dueño no tocó y marca la sala de espera", () => {
    const out = withSportCampaigns(savedV14()).data!;
    const byId = (id: string) => out.themes.find((t) => t.id === id)!;
    for (const id of ["vuelta-al-gym", "dia-del-padre", "operacion-verano"]) {
      const def = seasonalThemes.find((t) => t.id === id)!;
      expect([byId(id).startsOn, byId(id).endsOn]).toEqual([def.startsOn, def.endsOn]);
    }
    expect(["black-friday", "cyber-monday", "hot-sale"].every((id) => byId(id).waitingRoom)).toBe(true);
    expect(byId("navidad").waitingRoom).toBeUndefined();
  });

  it("respeta lo que editó el dueño: fechas propias, titulares, productos y cupones", () => {
    const saved = savedV14((themes) => themes.map((t) =>
      t.id === "dia-del-padre" ? { ...t, startsOn: "2027-06-10", endsOn: "2027-06-21" }
        : t.id === "black-friday" ? { ...t, headline: "Mi Black", productSlugs: ["colageno"], couponCode: "MIO" } : t));
    saved.data.coupons = [...saved.data.coupons.filter((c) => c.code !== "BLACK30"), { code: "KM12", type: "FIXED", value: 1000, description: "Propio", active: false }];
    const out = withSportCampaigns(saved).data!;
    const padre = out.themes.find((t) => t.id === "dia-del-padre")!;
    expect([padre.startsOn, padre.endsOn]).toEqual(["2027-06-10", "2027-06-21"]);
    const bf = out.themes.find((t) => t.id === "black-friday")!;
    expect([bf.headline, bf.productSlugs, bf.couponCode, bf.waitingRoom]).toEqual(["Mi Black", ["colageno"], "MIO", true]);
    // El cupón con el mismo código que ya había no se pisa; uno borrado por el dueño no vuelve.
    expect(out.coupons.filter((c) => c.code === "KM12")).toEqual([{ code: "KM12", type: "FIXED", value: 1000, description: "Propio", active: false }]);
    expect(out.coupons.some((c) => c.code === "BLACK30")).toBe(false);
  });

  it("no duplica nada si se corre dos veces", () => {
    const once = withSportCampaigns(savedV14());
    const twice = withSportCampaigns(once).data!;
    expect(twice.themes).toHaveLength(17);
    expect(new Set(twice.coupons.map((c) => c.code)).size).toBe(twice.coupons.length);
  });

  it("migrateAdminData corre v14 → v15 y deja intacto lo que ya está en v15", () => {
    const out = migrateAdminData(savedV14(), 14) as AdminData;
    expect(out.data.themes).toHaveLength(17);
    const current = defaultAdminData();
    expect(migrateAdminData(current, 15)).toBe(current);
  });
});
