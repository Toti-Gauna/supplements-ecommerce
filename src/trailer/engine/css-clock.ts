/**
 * Reloj para animaciones CSS reales de la app (la pantalla de carga, las luces de la ruleta): se pausan al armar la escena y
 * el timeline les fija el tiempo en cada cuadro, así saltar a cualquier segundo da el mismo dibujo. Con movimiento reducido
 * la app no declara esas animaciones y queda su último cuadro, que es lo que muestra la lámina.
 */
export function cssAnimations(roots: Element[]): Animation[] {
  const list = roots.flatMap((r) => r.getAnimations({ subtree: true }));
  for (const a of list) a.pause();
  return list;
}

export function setCssTime(anims: Animation[], ms: number) {
  for (const a of anims) a.currentTime = Math.max(0, ms);
}

/**
 * Lo que la app anima por su cuenta y ninguna receta maneja (destellos de la revelación, costuras que entran, transiciones
 * que dispara un cambio de clase) corre con el reloj de la pared: al congelar un cuadro se lleva a su final (o al inicio si
 * es infinito), así el dibujo no depende de cuánto tardó la máquina en sacar la captura.
 */
export function settleLooseAnimations(root: Element) {
  for (const a of root.getAnimations({ subtree: true })) {
    if (a.playState === "paused") continue;
    if (a.effect?.getComputedTiming().iterations === Infinity) { a.pause(); a.currentTime = 0; } else a.finish();
  }
}
