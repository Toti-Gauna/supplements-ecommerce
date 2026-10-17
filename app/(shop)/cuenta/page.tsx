import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { AccountView } from "@/features/account/AccountView";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Mi cuenta">Mi box con tus potes en uso, pedidos, suscripciones a packs, regalos, misiones, premios y direcciones (datos de muestra).</PageHeader>
      <AccountView />
    </>
  );
}
