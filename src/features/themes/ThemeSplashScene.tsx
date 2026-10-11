"use client";
import { useReducedMotion } from "motion/react";
import type { ComponentType } from "react";
import { useState, useSyncExternalStore } from "react";
import { seasonalThemes, themeCoupons } from "@/demo/fixtures/themes";
import type { SeasonId } from "@/demo/types";
import { AMBIENT } from "./ambient";
import { AmbientField } from "./AmbientField";
import { SKINS } from "./skins";
import dynamic from "next/dynamic";
import { SceneClock, splashElapsed } from "./splash/kit";

const noop = () => () => {};
const readSeason = () => (document.documentElement.dataset.season as SeasonId | undefined) ?? null;

/** ¿Ya cayó el telón? (fin de la animación, o `splash-done` que pone el script a los 5,2 s o con Escape). */
function subscribeCurtain(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const splash = document.getElementById("volta-splash");
  splash?.addEventListener("animationend", cb);
  return () => { mo.disconnect(); splash?.removeEventListener("animationend", cb); };
}
const readCurtain = () => document.documentElement.classList.contains("splash-done")
  || Boolean(document.getElementById("volta-splash")?.getAnimations?.().some((a) => (a as CSSAnimation).animationName === "splash-curtain" && a.playState === "finished"));
const hotSalePct = themeCoupons.find((c) => c.themeId === "hot-sale")?.value ?? 30;

/**
 * La escena se monta cuando ya bajó su archivo: el reloj se mide en ese momento (y no antes), así sus retrasos
 * negativos arrancan donde corresponde y llega a su final antes del telón.
 */
function clocked(Scene: ComponentType): ComponentType {
  return function ClockedScene() {
    const [offset] = useState(splashElapsed);
    return <SceneClock.Provider value={offset}><Scene /></SceneClock.Provider>;
  };
}
// Si el archivo no llega (red cortada, versión vieja abierta), la escena simplemente no aparece: es decorativa.
const lazy = (load: () => Promise<ComponentType>) => dynamic(() => load().then(clocked, () => function NoScene() { return null; }), { ssr: false });

/** Una escena distinta por festividad (motion graphics); cada visita descarga solo la de su fecha. */
const SCENES: Record<SeasonId, ComponentType> = {
  navidad: lazy(() => import("./splash/night").then((m) => m.ChristmasScene)),
  halloween: lazy(() => import("./splash/night").then((m) => m.HalloweenScene)),
  "ano-nuevo": lazy(() => import("./splash/celebration").then((m) => m.NewYearScene)),
  "black-friday": lazy(() => import("./splash/celebration").then((m) => m.BlackFridayScene)),
  "hot-sale": lazy(() => import("./splash/celebration").then((m) => function HotSale() { return <m.HotSaleScene discount={hotSalePct} />; })),
  "san-valentin": lazy(() => import("./splash/valentine").then((m) => m.ValentineScene)),
  "dia-de-la-madre": lazy(() => import("./splash/mothers").then((m) => m.MothersScene)),
  pascuas: lazy(() => import("./splash/easter").then((m) => m.EasterScene)),
  orgullo: lazy(() => import("./splash/pride").then((m) => m.PrideScene)),
  "revolucion-de-mayo": lazy(() => import("./splash/patrias").then((m) => m.MayoScene)),
  "dia-de-la-bandera": lazy(() => import("./splash/patrias").then((m) => m.BanderaScene)),
  "dia-de-la-independencia": lazy(() => import("./splash/patrias").then((m) => m.IndependenciaScene)),
  "dia-del-animal": lazy(() => import("./splash/play").then((m) => m.AnimalScene)),
  "dia-del-nino": lazy(() => import("./splash/play").then((m) => m.KidsScene)),
  "dia-del-padre": lazy(() => import("./splash/cast").then((m) => m.FathersScene)),
  "dia-del-amigo": lazy(() => import("./splash/cast").then((m) => m.FriendsScene)),
};

/**
 * Escena de temporada dentro de la pantalla de carga. El script del <head> ya marcó `data-season` (colores del
 * fondo sin parpadeo); esto suma la animación propia de cada fecha sobre las partículas de su fondo.
 */
export function ThemeSplashScene() {
  const id = useSyncExternalStore(noop, readSeason, () => null);
  // Al caer el telón (o con "reducir movimiento") la escena se desmonta: sus animaciones en bucle no siguen
  // corriendo escondidas el resto de la visita.
  const done = useSyncExternalStore(subscribeCurtain, readCurtain, () => false);
  const reduce = useReducedMotion();
  if (!id || !SKINS[id] || done || reduce) return null;
  const Scene = SCENES[id];
  const name = seasonalThemes.find((t) => t.id === id)?.name ?? "";
  return (
    <div aria-hidden="true" className="season-scene">
      <AmbientField layers={AMBIENT[id]} density={1.2} className="absolute inset-0" />
      <Scene />
      <p className="season-tag eyebrow left-1/2 -translate-x-1/2 whitespace-nowrap">Especial {name}</p>
    </div>
  );
}
