import type { Metadata } from "next";
import { ImportWizard } from "@/features/admin/import/ImportWizard";

export const metadata: Metadata = { title: "Importar desde Excel" };

export default function AdminImportPage() {
  return <ImportWizard />;
}
