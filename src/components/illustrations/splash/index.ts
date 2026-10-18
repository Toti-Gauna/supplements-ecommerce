import type { ComponentType } from "react";
import type { SplashSceneId } from "@/demo/engine/splash-scenes";
import { blackFridayLayers } from "./black-friday";
import { crossfitOpenLayers } from "./crossfit-open";
import { diaActividadFisicaLayers } from "./dia-actividad-fisica";
import { diaDelBoxeadorLayers } from "./dia-del-boxeador";
import { diaDelFutbolistaLayers } from "./dia-del-futbolista";
import { diaDelRunningLayers } from "./dia-del-running";
import { hotSaleLayers } from "./hot-sale";
import { navidadLayers } from "./navidad";
import { operacionVeranoLayers } from "./operacion-verano";
import { vueltaAlGymLayers } from "./vuelta-al-gym";

/**
 * Capas de arte de cada pantalla de carga por fecha (R3c), en orden de abajo hacia arriba. Se publican como SVG en
 * `public/splash/<id>/<n>.svg` (n desde 1) con `SPLASH_ART_WRITE=1 npx vitest run tests/unit/r3c-splash-art.test.ts`;
 * ese mismo test falla si un archivo publicado no coincide con su dibujo. La fase 2 suma acá las 13 fechas que faltan.
 */
export const SPLASH_ART: Partial<Record<SplashSceneId, ComponentType[]>> = {
  "black-friday": blackFridayLayers,
  "hot-sale": hotSaleLayers,
  "vuelta-al-gym": vueltaAlGymLayers,
  navidad: navidadLayers,
  "operacion-verano": operacionVeranoLayers,
  "crossfit-open": crossfitOpenLayers,
  "dia-actividad-fisica": diaActividadFisicaLayers,
  "dia-del-futbolista": diaDelFutbolistaLayers,
  "dia-del-running": diaDelRunningLayers,
  "dia-del-boxeador": diaDelBoxeadorLayers,
};
