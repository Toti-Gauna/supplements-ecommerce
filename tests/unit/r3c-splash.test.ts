import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { splashOff } from "@/demo/engine/splash-off";
import { pendingSplashScenes, readySplashScene, splashLayerMap, splashLayerUrls, SPLASH_ART_VERSION, SPLASH_MAX_LAYERS, SPLASH_SCENES } from "@/demo/engine/splash-scenes";
import { seasonalThemes } from "@/demo/fixtures/themes";
import { splashMarks } from "@/features/splash/marks";
import { seasonScript } from "@/features/themes/seasonScript";
import { SKINS } from "@/features/themes/skins";

/** Pantallas de carga por fecha (R3c): el registro, el descuento del marcador y lo que marca el script del <head>. */
const ROOT = join(__dirname, "../..");
const SEASONS = Object.keys(SKINS).sort();
/** Escenas terminadas, con sus capas: la original, las cuatro de referencia de la fase 1 y las de la fase 2. */
const READY_LAYERS: Record<string, number> = {
  original: 0,
  "black-friday": 4,
  "hot-sale": 5,
  "vuelta-al-gym": 4,
  navidad: 7,
  "operacion-verano": 5,
  "crossfit-open": 6,
  "dia-actividad-fisica": 6,
  "dia-del-futbolista": 5,
  "dia-del-running": 7,
  "dia-del-boxeador": 4,
};
const READY = Object.keys(READY_LAYERS);

describe("registro de pantallas de carga", () => {
  it("cubre cada fecha y la original, sin sobrantes", () => {
    expect(Object.keys(SPLASH_SCENES).sort()).toEqual([...SEASONS, "original"].sort());
    expect(seasonalThemes.map((t) => t.id).sort()).toEqual(SEASONS);
    for (const [id, s] of Object.entries(SPLASH_SCENES)) expect(s.mechanism.length, id).toBeGreaterThan(20);
  });

  it("cada escena terminada está lista con sus capas; las que faltan siguen pendientes con la variante de campaña", () => {
    for (const [id, layers] of Object.entries(READY_LAYERS)) {
      expect(SPLASH_SCENES[id as keyof typeof SPLASH_SCENES], id).toMatchObject({ status: "ready", layers });
    }
    const ready = Object.keys(SPLASH_SCENES).filter((id) => SPLASH_SCENES[id as keyof typeof SPLASH_SCENES].status === "ready");
    expect(ready.sort()).toEqual([...READY].sort());
    expect(pendingSplashScenes().sort()).toEqual(SEASONS.filter((id) => !READY.includes(id)).sort());
    expect(pendingSplashScenes()).toHaveLength(SEASONS.length + 1 - READY.length);
  });

  it("cada escena terminada tiene su hoja de estilos, importada, y capas dentro del máximo", () => {
    const index = readFileSync(join(ROOT, "app/splash-scenes/index.css"), "utf8");
    for (const id of READY.filter((r) => r !== "original")) {
      const css = join(ROOT, `app/splash-scenes/${id}.css`);
      expect(existsSync(css), id).toBe(true);
      expect(readFileSync(css, "utf8"), id).toContain(`.splash-stage[data-scene="${id}"]`);
      expect(index, id).toContain(`@import "./${id}.css";`);
      const layers = SPLASH_SCENES[id as keyof typeof SPLASH_SCENES].layers;
      expect(layers, id).toBeGreaterThan(1);
      expect(layers, id).toBeLessThanOrEqual(SPLASH_MAX_LAYERS);
    }
  });

  it("elige la escena: terminada, la original sin fecha, null si la fecha sigue con la variante de campaña", () => {
    expect(readySplashScene("black-friday")).toBe("black-friday");
    expect(readySplashScene(null)).toBe("original");
    expect(readySplashScene("halloween")).toBeNull();
    expect(splashLayerMap()).toEqual(Object.fromEntries(Object.entries(READY_LAYERS).filter(([, n]) => n > 0)));
    expect(splashLayerUrls("/supplements-ecommerce", "hot-sale")[4]).toBe(`/supplements-ecommerce/splash/hot-sale/5.svg?v=${SPLASH_ART_VERSION}`);
    expect(splashLayerUrls("", "halloween")).toEqual([]);
  });
});

describe("descuento del marcador (cuentakilómetros)", () => {
  it("porcentaje, monto fijo y lo que no se muestra", () => {
    expect(splashOff({ type: "PERCENT", value: 30 })).toEqual({ pre: "−", suf: " %", dn: 2, cols: [0, 3, 0] });
    expect(splashOff({ type: "PERCENT", value: 100 })).toEqual({ pre: "−", suf: " %", dn: 3, cols: [1, 0, 0] });
    expect(splashOff({ type: "FIXED", value: 5000 })).toEqual({ pre: "−$ ", suf: ".000", dn: 1, cols: [0, 0, 5] });
    expect(splashOff({ type: "FIXED", value: 12500 })).toEqual({ pre: "−$ ", suf: ".500", dn: 2, cols: [0, 1, 2] });
    expect(splashOff({ type: "FIXED", value: 800 })).toEqual({ pre: "−$ ", suf: "", dn: 3, cols: [8, 0, 0] });
    expect(splashOff({ type: "FREE_SHIPPING", value: 0 })).toBeNull();
    expect(splashOff({ type: "PERCENT", value: 15, active: false })).toBeNull();
    expect(splashOff({ type: "FIXED", value: 2_500_000 })).toBeNull();
    expect(splashOff(null)).toBeNull();
  });
});

/** Corre el script del <head> con un documento de mentira y devuelve lo que marcó. */
function runSeasonScript(previewId: string, reduce = false) {
  const attrs: Record<string, string> = {};
  const vars: Record<string, string> = {};
  const preloads: string[] = [];
  const html = { setAttribute: (k: string, v: string) => { attrs[k] = v; }, classList: { add() {} }, style: { setProperty: (k: string, v: string) => { vars[k] = v; } } };
  const store: Record<string, string> = { "volta-demo:theme-preview": JSON.stringify({ state: { previewId }, version: 0 }) };
  runInNewContext(seasonScript, {
    document: { documentElement: html, head: { appendChild: (l: { href: string }) => preloads.push(l.href) }, createElement: () => ({}) },
    window: { localStorage: { getItem: (k: string) => store[k] ?? null } },
    location: { pathname: "/" },
    matchMedia: () => ({ matches: reduce }),
    JSON, String, Math, Number, Date,
  });
  return { attrs, vars, preloads };
}

describe("script del <head>", () => {
  it("con una fecha con escena: la marca, deja sus capas, las pide antes y deja el descuento en las ruedas", () => {
    const { attrs, vars, preloads } = runSeasonScript("black-friday");
    expect(attrs).toMatchObject({ "data-season": "black-friday", "data-splash-campaign": "", "data-splash-scene": "black-friday", "data-splash-dn": "2" });
    expect(vars["--sl4"]).toBe(`url("/splash/black-friday/4.svg?v=${SPLASH_ART_VERSION}")`);
    expect(preloads).toHaveLength(4);
    expect([vars["--sd0"], vars["--sd1"], vars["--sd2"], vars["--splash-pre"], vars["--splash-suf"]]).toEqual(["0", "3", "0", '"−"', '" %"']);
    // Igual que la vista previa del panel y el modo vitrina (splashMarks).
    const marks = splashMarks({ id: "black-friday", name: "Black Friday", coupon: { type: "PERCENT", value: 30 } }, "");
    for (const k of ["--sl1", "--sd1", "--splash-name", "--splash-pre"]) expect(marks.vars[k], k).toBe(vars[k]);
  });

  it("con reducir movimiento no pide el arte; sin escena todavía queda la variante de campaña; sin fecha, nada", () => {
    expect(runSeasonScript("navidad", true).preloads).toEqual([]);
    const halloween = runSeasonScript("halloween");
    expect(halloween.attrs["data-splash-campaign"]).toBe("");
    expect(halloween.attrs["data-splash-scene"]).toBeUndefined();
    expect(halloween.vars["--sl1"]).toBeUndefined();
    expect(runSeasonScript("original").attrs).toEqual({});
    expect(splashMarks(null, "")).toEqual({ scene: null, campaign: false, digits: null, vars: {} });
  });
});
