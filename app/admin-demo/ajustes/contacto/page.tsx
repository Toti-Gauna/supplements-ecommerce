import type { Metadata } from "next";
import { ContactSettings } from "@/features/admin/settings/ContactSettings";

export const metadata: Metadata = { title: "Contacto y WhatsApp" };

export default function Page() {
  return <ContactSettings />;
}
