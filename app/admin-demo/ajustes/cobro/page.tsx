import type { Metadata } from "next";
import { CollectionSettings } from "@/features/admin/settings/CollectionSettings";

export const metadata: Metadata = { title: "Datos de cobro" };

export default function Page() {
  return <CollectionSettings />;
}
