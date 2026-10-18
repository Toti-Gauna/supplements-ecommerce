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
