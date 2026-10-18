import { splashOff } from "@/demo/engine/splash-off";
import { readySplashScene, splashLayerUrls, SPLASH_MAX_LAYERS, type SplashSceneId } from "@/demo/engine/splash-scenes";
import type { Coupon, SeasonId } from "@/demo/types";
import { seasonAccentVariables } from "@/features/themes/palettes";

/** Una fecha para la pantalla de carga: su id, el nombre de la campaña y el cupón (puede ser el borrador del panel). */
export interface SplashDate {
  id: SeasonId;
  name: string;
  coupon?: Pick<Coupon, "type" | "value" | "active"> | null;
}

export interface SplashMarks {
  /** Escena propia (`data-splash-scene` / `data-scene`), o null: la original o la variante de campaña. */
  scene: Exclude<SplashSceneId, "original"> | null;
  /** Hay campaña (`data-splash-campaign`). */
  campaign: boolean;
  /** Ruedas del descuento (`data-splash-dn` / `data-dn`), o null sin descuento. */
  digits: number | null;
  /** Variables CSS: capas, nombre, descuento y el acento de la fecha. */
  vars: Record<string, string>;
}

/** Todas las variables que puede dejar una fecha (para limpiar las de la anterior). */
export const SPLASH_VARS = [
  "--splash-name", "--splash-pre", "--splash-suf", "--sd0", "--sd1", "--sd2",
  ...Array.from({ length: SPLASH_MAX_LAYERS }, (_, i) => `--sl${i + 1}`),
];
export const SPLASH_ACCENT_VARS = ["--season-accent", "--season-accent-ink", "--season-glow"];

/**
 * Lo mismo que marca el script del <head> (`seasonScript.ts`) para una fecha, como datos: lo usan la vista previa del
 * panel y "Ver la pantalla de carga" del modo vitrina, que la muestran sin recargar la página.
 */
export function splashMarks(date: SplashDate | null, base: string): SplashMarks {
  if (!date) return { scene: null, campaign: false, digits: null, vars: {} };
  const ready = readySplashScene(date.id);
  const scene = ready && ready !== "original" ? ready : null;
  const off = splashOff(date.coupon ?? null);
  const vars: Record<string, string> = { "--splash-name": JSON.stringify(date.name), ...seasonAccentVariables(date.id) };
  if (scene) splashLayerUrls(base, scene).forEach((url, i) => { vars[`--sl${i + 1}`] = `url("${url}")`; });
  if (off) {
    vars["--splash-pre"] = JSON.stringify(off.pre);
    vars["--splash-suf"] = JSON.stringify(off.suf);
    off.cols.forEach((c, i) => { vars[`--sd${i}`] = String(c); });
  }
  return { scene, campaign: true, digits: off?.dn ?? null, vars };
}
