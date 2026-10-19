import { beatSec } from "../core/timeline";
import { STAGE, type Ratio, type TrailerSpec } from "../core/types";
import { RECIPES } from "../recipes";
import { gsap, type Timeline } from "./gsap";

/**
 * Arma el timeline maestro (pausado: lo mueve el reloj). Cada escena entra visible en su `start`, sale al terminar y
 * suma el timeline de su receta en ese punto. El maestro dura exactamente lo que dice el trailer.
 */
export function buildMaster(spec: TrailerSpec, stageEl: HTMLElement, ratio: Ratio, reduced = false): Timeline {
  const master = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  for (const scene of spec.scenes) {
    const recipe = RECIPES[scene.recipe];
    const root = stageEl.querySelector<HTMLElement>(`[data-escena="${scene.id}"]`);
    if (!recipe || !root) throw new Error(`Escena ${scene.id}: falta ${recipe ? "su DOM" : `la receta "${scene.recipe}"`}`);
    const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
    master.set(root, { autoAlpha: 1 }, scene.start);
    const built = recipe.build({ root, q, props: scene.props ?? {}, dur: scene.dur, ratio, stage: STAGE[ratio], reduced, beat: beatSec(spec.bpm) });
    if (scene.speed && scene.speed !== 1) built.timeScale(scene.speed);
    master.add(built, scene.start);
    if (scene.start + scene.dur < spec.duration) master.set(root, { autoAlpha: 0 }, scene.start + scene.dur);
  }
  master.set({}, {}, spec.duration);
  return master;
}
