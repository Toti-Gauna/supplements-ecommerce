import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { WithdrawalForm } from "@/features/legal/WithdrawalForm";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

export default function WithdrawalPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Botón de arrepentimiento">
        Podés revocar la compra dentro de los 10 días corridos desde la entrega, sin registrarte (Res. 424/2020). Te damos un código al instante.
      </PageHeader>
      <WithdrawalForm />
    </div>
  );
}
