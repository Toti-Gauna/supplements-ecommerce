import type { SeasonId } from "../types";

/**
 * Pantallas de carga por fecha (R3c, docs/plan-rediseno.md §6): una escena mecánica propia por fecha y la original.
 * Cada escena se arma con capas SVG en `public/splash/<id>/<n>.svg` (las dibuja `src/components/illustrations/splash/`)
 * que el CSS de `app/splash-scenes/<id>.css` mueve solo con transform u opacity. El script del <head> marca la fecha
 * con `data-splash-scene` y deja las capas en `--sl1…--slN`: el navegador baja solo el arte de la fecha puesta.
 *
 * `ready`: escena propia terminada. `pending`: la fecha sigue con la variante de campaña de R3a (barra con los discos
 * del color de la fecha y el marcador con el descuento) hasta la fase 2; `mechanism` dice qué escena le toca.
 */
export type SplashSceneId = SeasonId | "original";

export interface SplashScene {
  status: "ready" | "pending";
  /** Capas de arte (0: la original, que va dibujada en el HTML y no baja nada). */
  layers: number;
  /** La mecánica de la escena, en una línea (para el panel y para la fase 2). */
  mechanism: string;
}

/** Cuántas capas como máximo tiene una escena (los huecos del HTML compartido). */
export const SPLASH_MAX_LAYERS = 7;
/** Versión del arte: se suma a la URL para que el navegador no use una capa vieja guardada. */
export const SPLASH_ART_VERSION = 1;

/** Línea de tiempo (ms hasta que termina el telón): original, variante de campaña de R3a y escena por fecha. */
export const SPLASH_TOTAL_MS = { original: 1400, campaign: 1800, scene: 1850 } as const;

const ready = (layers: number, mechanism: string): SplashScene => ({ status: "ready", layers, mechanism });
const pending = (mechanism: string): SplashScene => ({ status: "pending", layers: 0, mechanism });

export const SPLASH_SCENES: Record<SplashSceneId, SplashScene> = {
  original: ready(0, "Barra olímpica: entran los discos de a pares, encastran y cierran los topes."),
  "black-friday": ready(4, "La persiana del local sube a tirones y se prende el marcador con el descuento."),
  "hot-sale": ready(5, "La barra se calienta en tres golpes (tres días) y la aguja del manómetro llega al rojo."),
  "vuelta-al-gym": ready(4, "Se tira la lona del verano que tapaba el rack, sale tiza y se prende la luz."),
  navidad: ready(7, "Se carga el árbol de discos: caen de a uno por el parante, del más grande al más chico."),
  "dia-de-la-madre": pending("Pulso: un monitor cardíaco dibuja el latido y se carga el pote de colágeno."),
  halloween: pending("Pesa rusa que se prende desde adentro como una calabaza, con humo de tiza."),
  "cyber-monday": pending("Rack de servidores: se encienden los LED de cada bahía y el marcador hace overclock."),
  "ano-nuevo": pending("Marcador de cuenta regresiva que pasa de 2026 a 2027 con flip de placas."),
  "san-valentin": pending("Dos mancuernas que se acercan y encastran en el soporte doble."),
  "dia-del-padre": pending("Peso muerto: la barra cargada se despega del piso y se trabaja el bloqueo."),
  "dia-del-amigo": pending("Dos shakers que chocan (brindis de gym) y el marcador cuenta las repes."),
  "operacion-verano": ready(5, "Termómetro de la costa que sube al rojo y botella que se carga de electrolitos en cuatro tramos."),
  "crossfit-open": ready(6, "Reloj de WOD: cuenta regresiva 3-2-1 con su pitido y arranca el tiempo en cero."),
  "dia-actividad-fisica": ready(6, "Zapatilla que pisa la línea de largada y el contador de pasos se carga celda por celda."),
  "dia-del-futbolista": ready(5, "Pelota que entra al arco de entrenamiento, hunde la red y cae picando adentro."),
  "dia-del-running": ready(7, "Cronómetro que se dispara y la cinta de llegada que se corta y cae desde los parantes."),
  "dia-del-boxeador": ready(4, "Campana del ring: el martillo golpea dos veces y arranca el round."),
};

/** La escena terminada de una fecha (o la original sin fecha); `null` si la fecha sigue con la variante de campaña. */
export function readySplashScene(id: SeasonId | null | undefined): SplashSceneId | null {
  const key: SplashSceneId = id ?? "original";
  return SPLASH_SCENES[key]?.status === "ready" ? key : null;
}

/** Las fechas con escena y arte para bajar (las que marca el script del <head>), con su número de capas. */
export function splashLayerMap(): Record<string, number> {
  return Object.fromEntries(Object.entries(SPLASH_SCENES).filter(([, s]) => s.status === "ready" && s.layers > 0).map(([id, s]) => [id, s.layers]));
}

/** URLs de las capas de una escena (con el basePath de Pages). */
export function splashLayerUrls(base: string, id: SplashSceneId): string[] {
  const n = SPLASH_SCENES[id]?.status === "ready" ? SPLASH_SCENES[id].layers : 0;
  return Array.from({ length: n }, (_, i) => `${base}/splash/${id}/${i + 1}.svg?v=${SPLASH_ART_VERSION}`);
}

/** Fechas que todavía usan la variante de campaña (fase 2). */
export function pendingSplashScenes(): SplashSceneId[] {
  return (Object.keys(SPLASH_SCENES) as SplashSceneId[]).filter((id) => SPLASH_SCENES[id].status === "pending");
}
