import { eclipseCta } from "../eclipse/cta";
import { eclipseGuino } from "../eclipse/guino";
import { eclipseIntro } from "../eclipse/intro";
import { eclipseOutro } from "../eclipse/outro";
import { eclipsePrices } from "../eclipse/prices";
import type { Recipe } from "../engine/recipe";
import { clones } from "./clones";
import { device } from "./device";
import { giftLive } from "./gift-live";
import { plate } from "./plate";
import { rules } from "./rules";
import { shakerReplay } from "./shaker-replay";
import { slam } from "./slam";
import { splashLive } from "./splash-live";
import { stack } from "./stack";
import { statpunch } from "./statpunch";
import { themeflip } from "./themeflip";
import { ticker } from "./ticker";
import { title } from "./title";
import { trace } from "./trace";
import { wheelLive } from "./wheel-live";
import { typewriter } from "./typewriter";

/**
 * Recetas disponibles (docs/trailer/biblia/referencias.md §3). Se portan de kinetic-studio a medida que un storyboard
 * las necesita; cada una en su archivo, con su componente y su `build` determinista.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cada receta tipa sus props; el registro las guarda juntas
export const RECIPES: Record<string, Recipe<any>> = {
  title, slam, statpunch, typewriter, themeflip, clones, ticker, trace, plate, device, rules, stack,
  "splash-live": splashLive, "gift-live": giftLive, "wheel-live": wheelLive, "shaker-replay": shakerReplay,
  "eclipse-intro": eclipseIntro, "eclipse-outro": eclipseOutro, "eclipse-cta": eclipseCta, "eclipse-prices": eclipsePrices, "eclipse-guino": eclipseGuino,
};
