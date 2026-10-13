import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { CheckoutView } from "@/features/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Finalizar compra">Como invitado o con tu cuenta. En la demo no se cobra nada.</PageHeader>
      <CheckoutView />
    </>
  );
}
