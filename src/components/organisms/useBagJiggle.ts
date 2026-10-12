"use client";
import { useState } from "react";

/**
 * Cuántas veces se sacudió la bolsa del header (sirve de `key` para reiniciar la animación). Se sacude cuando entra algo
 * con la página ya cargada (no al recuperar el carrito guardado). Si entra con el carrito abierto (agregar abre el
 * panel), la bolsa queda tapada: se sacude al cerrarlo, que es cuando el cliente la ve (Fase 8).
 */
export function useBagJiggle(count: number, hydrated: boolean, cartOpen: boolean): number {
  const [prev, setPrev] = useState({ count, hydrated, cartOpen, pending: false });
  const [jiggle, setJiggle] = useState(0);
  if (prev.count !== count || prev.hydrated !== hydrated || prev.cartOpen !== cartOpen) {
    const added = prev.hydrated && hydrated && count > prev.count;
    if ((added || prev.pending) && !cartOpen) setJiggle((j) => j + 1);
    setPrev({ count, hydrated, cartOpen, pending: (added || prev.pending) && cartOpen });
  }
  return jiggle;
}
