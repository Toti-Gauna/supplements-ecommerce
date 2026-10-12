"use client";
import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { demoData } from "@/demo/engine/source";
import { themeOffer } from "@/demo/engine/themes";
import type { SeasonId } from "@/demo/types";
import { AMBIENT } from "./ambient";
import { AmbientField } from "./AmbientField";
import { SKINS } from "./skins";
import { SceneClock, splashElapsed, type SceneProps } from "./splash/kit";

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

type Scene = ComponentType<SceneProps>;
/**
 * La escena se monta cuando ya bajó su archivo: el reloj se mide en ese momento (y no antes), así sus retrasos
 * negativos arrancan donde corresponde y llega a su final antes del telón.
 */
function clocked(Inner: Scene): Scene {
  return function ClockedScene(props: SceneProps) {
    const [offset] = useState(splashElapsed);
    return <SceneClock.Provider value={offset}><Inner {...props} /></SceneClock.Provider>;
  };
}
// Si el archivo no llega (red cortada, versión vieja abierta), la escena simplemente no aparece: es decorativa.
const lazy = (load: () => Promise<Scene>) => dynamic(() => load().then(clocked, () => function NoScene() { return null; }), { ssr: false });

/** Una escena propia por fecha (motion graphics en CSS); cada visita descarga solo la de su temática. */
const SCENES: Record<SeasonId, Scene> = {
  "dia-de-la-madre": lazy(() => import("./splash/charge").then((m) => m.MothersScene)),
  "vuelta-al-gym": lazy(() => import("./splash/charge").then((m) => m.BackToGymScene)),
  navidad: lazy(() => import("./splash/circle").then((m) => m.ChristmasScene)),
  "operacion-verano": lazy(() => import("./splash/circle").then((m) => m.SummerScene)),
  "black-friday": lazy(() => import("./splash/sale").then((m) => m.BlackFridayScene)),
  "hot-sale": lazy(() => import("./splash/sale").then((m) => m.HotSaleScene)),
  "cyber-monday": lazy(() => import("./splash/cyber").then((m) => m.CyberScene)),
  "ano-nuevo": lazy(() => import("./splash/party").then((m) => m.NewYearScene)),
  "san-valentin": lazy(() => import("./splash/party").then((m) => m.ValentineScene)),
  halloween: lazy(() => import("./splash/crew").then((m) => m.HalloweenScene)),
  "dia-del-padre": lazy(() => import("./splash/crew").then((m) => m.FathersScene)),
  "dia-del-amigo": lazy(() => import("./splash/crew").then((m) => m.FriendsScene)),
};

/**
 * Escena de temporada dentro de la pantalla de carga. El script del <head> ya marcó `data-season` (colores del
 * fondo sin parpadeo); esto suma la animación propia de cada fecha alrededor del logo compacto, cuya caja se mide
 * para que ninguna pieza lo pise (ver splash/rig.tsx).
 */
export function ThemeSplashScene() {
  const id = useSyncExternalStore(noop, readSeason, () => null);
  // Al caer el telón (o con "reducir movimiento") la escena se desmonta: sus animaciones en bucle no siguen
  // corriendo escondidas el resto de la visita.
  const done = useSyncExternalStore(subscribeCurtain, readCurtain, () => false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const brand = document.querySelector("#volta-splash .splash-brand")?.getBoundingClientRect();
    const el = ref.current;
    if (!brand || !el || !brand.width) return;
    el.style.setProperty("--bw", `${Math.ceil(brand.width / 2)}px`);
    el.style.setProperty("--bh", `${Math.ceil(brand.height / 2)}px`);
    el.style.setProperty("--bd", `${Math.ceil(Math.hypot(brand.width, brand.height) / 2)}px`);
  }, [id, done, reduce]);
  if (!id || !SKINS[id] || done || reduce) return null;
  const Scene = SCENES[id];
  const theme = demoData().themes.find((t) => t.id === id);
  const offer = theme ? themeOffer(theme)?.label ?? null : null;
  return (
    <div ref={ref} aria-hidden="true" className="season-scene" data-scene={id}>
      <AmbientField layers={AMBIENT[id]} density={1.2} className="absolute inset-0" />
      <Scene offer={offer} />
      <p className="season-tag eyebrow left-1/2 -translate-x-1/2 whitespace-nowrap">Especial {theme?.name ?? ""}</p>
    </div>
  );
}
