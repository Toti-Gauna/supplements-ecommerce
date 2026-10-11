import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { CheckoutView } from "@/features/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout (demo)" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout de demostración">Como invitado o con cuenta demo. Nada se cobra.</PageHeader>
      <CheckoutView />
    </>
  );
}
