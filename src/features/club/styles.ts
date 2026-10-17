/**
 * Placas del Club sobre bandas noche (iguales en los dos modos): acero oscuro con bisel, luz arriba y canto abajo. La
 * `plate` del sistema usa la superficie de la página (papel de día), así que sobre la noche va esta.
 */
export const NIGHT_PLATE =
  "bg-[linear-gradient(180deg,rgb(255_255_255/0.075),rgb(255_255_255/0.02))] shadow-[inset_1px_1px_0_rgb(255_255_255/0.1),inset_-1px_-1px_0_rgb(0_0_0/0.45)] ring-1 ring-white/10";

/** La placa encendida: la del nivel actual o tu fila en un ranking. */
export const NIGHT_PLATE_ON = "bg-volt/10 shadow-[inset_0_2px_0_var(--color-volt),0_0_32px_-14px_var(--color-volt)] ring-1 ring-volt/70";

/** Banda noche del Club: piso de caucho con el halo de marca. */
export const NIGHT_BAND = "floor led-dark relative overflow-hidden rounded-sm p-6 text-on-night sm:p-10 lg:p-14";
