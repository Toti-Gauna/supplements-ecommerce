import { ViewTransition, type ReactNode } from "react";

/**
 * Transición entre dos páginas de la misma ruta (ficha → ficha, categoría → categoría): la plantilla de la tienda no
 * se remonta cuando solo cambia el slug, así que cada página lleva su propia transición con la clave del slug.
 */
export function PageSwap({ id, children }: { id: string; children: ReactNode }) {
  return <ViewTransition key={id} enter="page-in" exit="page-out" default="none">{children}</ViewTransition>;
}
