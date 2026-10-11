import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { AccountView } from "@/features/account/AccountView";

export const metadata: Metadata = { title: "Mi cuenta (demo)" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Mi cuenta">Pedidos, misiones con progreso, premios y direcciones (datos de muestra).</PageHeader>
      <AccountView />
    </>
  );
}
