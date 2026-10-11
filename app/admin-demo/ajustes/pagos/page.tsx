import type { Metadata } from "next";
import { PaymentSettings } from "@/features/admin/settings/PaymentSettings";

export const metadata: Metadata = { title: "Medios de pago" };

export default function Page() {
  return <PaymentSettings />;
}
