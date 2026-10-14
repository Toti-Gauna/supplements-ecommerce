import type { ReactNode } from "react";
import { PageTransition } from "./PageTransition";

/**
 * Transición entre dos páginas de la misma ruta (ficha → ficha, categoría → categoría): la plantilla de la tienda no
 * se remonta cuando solo cambia el slug, así que cada página lleva su propia transición con la clave del slug.
 */
export function PageSwap({ id, children }: { id: string; children: ReactNode }) {
  return <PageTransition key={id}>{children}</PageTransition>;
}
