import type { Metadata } from "next";
import { ContactSettings } from "@/features/admin/settings/ContactSettings";

export const metadata: Metadata = { title: "Ajustes" };

/** Ajustes: la primera pestaña es Contacto y WhatsApp; las demás partes tienen su ruta (ver `menu.ts`). */
export default function Page() {
  return <ContactSettings />;
}
