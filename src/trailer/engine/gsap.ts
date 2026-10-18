"use client";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";

/**
 * Único archivo que registra plugins y curvas del trailer. Las recetas importan `gsap` desde acá, nunca desde "gsap":
 * así el registro corre siempre antes y GSAP vive solo en el chunk del trailer.
 */
gsap.registerPlugin(CustomEase, SplitText);
/** La curva de Eclipse (`--ease-expo`): arranque rápido, aterrizaje largo. */
CustomEase.create("trl.expo", "0.16,1,0.3,1");
/** Latigazo de cámara: acelera y frena seco. */
CustomEase.create("trl.whip", "0.7,0,0.2,1");
/** El cruce de la luna y el destello del loader de Eclipse (`components/loader/loader.css`). */
CustomEase.create("trl.moon", "0.45,0,0.25,1");
CustomEase.create("trl.glint", "0.2,0.7,0.3,1");
/** Golpe: pasa de largo un poco y vuelve. */
CustomEase.create("trl.punch", "0.2,1.4,0.4,1");

export { gsap, SplitText };
export type Timeline = gsap.core.Timeline;
