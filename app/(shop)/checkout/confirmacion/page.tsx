import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { ConfirmationView } from "@/features/order/ConfirmationView";

export const metadata: Metadata = { title: "Pedido de demostración" };

export default function ConfirmationPage() {
  return (
    <>
      <PageHeader title="Confirmación (demo)" />
      <ConfirmationView />
    </>
  );
}
