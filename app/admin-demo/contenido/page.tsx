import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Contenido" };

/** Contenido ahora son pestañas dentro de Ajustes; la entrada lleva al carrusel. */
export default function AdminContenidoMovedPage() {
  return <ModuleMoved from="/admin-demo/contenido" />;
}
