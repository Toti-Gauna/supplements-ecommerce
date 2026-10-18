import type { Metadata } from "next";
import { ModuleMoved } from "@/features/admin/ModuleMoved";

export const metadata: Metadata = { title: "Ajustes" };

/** Contacto es la primera pestaña de Ajustes. */
export default function AdminAjustesContactoMovedPage() {
  return <ModuleMoved from="/admin-demo/ajustes/contacto" />;
}
