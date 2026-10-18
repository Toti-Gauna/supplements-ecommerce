import { eclipseCta } from "../eclipse/cta";
import { eclipseIntro } from "../eclipse/intro";
import { eclipseOutro } from "../eclipse/outro";
import { eclipsePrices } from "../eclipse/prices";
import type { Recipe } from "../engine/recipe";
import { slam } from "./slam";
import { statpunch } from "./statpunch";
import { themeflip } from "./themeflip";
import { title } from "./title";
import { typewriter } from "./typewriter";

/**
 * Recetas disponibles (docs/trailer/biblia/referencias.md §3). Se portan de kinetic-studio a medida que un storyboard
 * las necesita; cada una en su archivo, con su componente y su `build` determinista.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cada receta tipa sus props; el registro las guarda juntas
export const RECIPES: Record<string, Recipe<any>> = {
  title, slam, statpunch, typewriter, themeflip,
  "eclipse-intro": eclipseIntro, "eclipse-outro": eclipseOutro, "eclipse-cta": eclipseCta, "eclipse-prices": eclipsePrices,
};
