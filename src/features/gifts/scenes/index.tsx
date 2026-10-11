"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GiftSceneId, GiftSceneProps } from "./types";

/** Mientras baja la escena (pocos KB): un brillo quieto en su lugar, sin saltos de tamaño. */
function Loading() {
  return <div aria-hidden="true" className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgb(227_255_143/0.25),transparent)]" />;
}

/** Si la escena no llega (red cortada), queda un regalo simple que igual se abre: nunca se rompe la página. */
function Fallback({ hits, total, opened }: GiftSceneProps) {
  return (
    <div className="grid h-full w-full place-items-center">
      <span aria-hidden="true" className="text-[8rem] leading-none transition-transform duration-300" style={{ transform: `scale(${opened ? 1.25 : 1 + (hits / total) * 0.15})` }}>{opened ? "✨" : "🎁"}</span>
    </div>
  );
}
const orFallback = (p: Promise<{ default: ComponentType<GiftSceneProps> }>) => p.catch(() => ({ default: Fallback }));

/**
 * Una escena por festividad, cada una en su propio archivo: se descarga solo la del regalo que se abre.
 * (next/dynamic necesita el import literal en cada entrada.)
 */
export const GIFT_SCENES: Record<GiftSceneId, ComponentType<GiftSceneProps>> = {
  volta: dynamic(() => orFallback(import("./volta")), { ssr: false, loading: Loading }),
  "dia-de-la-madre": dynamic(() => orFallback(import("./madre")), { ssr: false, loading: Loading }),
  pascuas: dynamic(() => orFallback(import("./pascuas")), { ssr: false, loading: Loading }),
  navidad: dynamic(() => orFallback(import("./navidad")), { ssr: false, loading: Loading }),
  halloween: dynamic(() => orFallback(import("./halloween")), { ssr: false, loading: Loading }),
  orgullo: dynamic(() => orFallback(import("./orgullo")), { ssr: false, loading: Loading }),
  "black-friday": dynamic(() => orFallback(import("./black-friday")), { ssr: false, loading: Loading }),
  "ano-nuevo": dynamic(() => orFallback(import("./ano-nuevo")), { ssr: false, loading: Loading }),
  "san-valentin": dynamic(() => orFallback(import("./san-valentin")), { ssr: false, loading: Loading }),
  "dia-del-animal": dynamic(() => orFallback(import("./animal")), { ssr: false, loading: Loading }),
  "hot-sale": dynamic(() => orFallback(import("./hot-sale")), { ssr: false, loading: Loading }),
  "revolucion-de-mayo": dynamic(() => orFallback(import("./mayo")), { ssr: false, loading: Loading }),
  "dia-del-padre": dynamic(() => orFallback(import("./padre")), { ssr: false, loading: Loading }),
  "dia-de-la-bandera": dynamic(() => orFallback(import("./bandera")), { ssr: false, loading: Loading }),
  "dia-de-la-independencia": dynamic(() => orFallback(import("./independencia")), { ssr: false, loading: Loading }),
  "dia-del-amigo": dynamic(() => orFallback(import("./amigo")), { ssr: false, loading: Loading }),
  "dia-del-nino": dynamic(() => orFallback(import("./nino")), { ssr: false, loading: Loading }),
};

/** Nombre corto de lo que se abre en cada escena (para el texto de la apertura y el lector de pantalla). */
export const GIFT_SCENE_NAMES: Record<GiftSceneId, string> = {
  volta: "Caja de regalo de Volta",
  "dia-de-la-madre": "Una flor que se abre pétalo a pétalo",
  pascuas: "Un huevo de Pascua",
  navidad: "El regalo de Papá Noel",
  halloween: "Una calabaza encantada",
  orgullo: "Un prisma de luz",
  "black-friday": "Una caja fuerte",
  "ano-nuevo": "Una botella de sidra",
  "san-valentin": "Una carta de amor",
  "dia-del-animal": "La cucha de Pancho",
  "hot-sale": "Una caja con mecha",
  "revolucion-de-mayo": "Un paraguas del Cabildo",
  "dia-del-padre": "Una caja de herramientas",
  "dia-de-la-bandera": "La bandera en su mástil",
  "dia-de-la-independencia": "Las puertas de la Casa de Tucumán",
  "dia-del-amigo": "El regalo de Pancho y Lola",
  "dia-del-nino": "Una piñata",
};

/** El nombre dentro de una frase ("se abre como: una flor…"), sin pasar a minúscula los nombres propios. */
export function sceneLabel(id: GiftSceneId): string {
  const name = GIFT_SCENE_NAMES[id];
  return name.charAt(0).toLowerCase() + name.slice(1);
}
