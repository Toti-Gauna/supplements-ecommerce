import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Panel demo · datos ficticios", template: "%s · Panel demo (datos ficticios)" },
  robots: { index: false, follow: false },
};

/** Panel de DEMOSTRACIÓN: accesible sin login a propósito, datos ficticios, estado solo en este navegador. */
export default function AdminDemoLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
