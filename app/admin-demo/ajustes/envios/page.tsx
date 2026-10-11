import type { Metadata } from "next";
import { ShippingSettings } from "@/features/admin/settings/ShippingSettings";

export const metadata: Metadata = { title: "Envíos y retiro" };

export default function Page() {
  return <ShippingSettings />;
}
