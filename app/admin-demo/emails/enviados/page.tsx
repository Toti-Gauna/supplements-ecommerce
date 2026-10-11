import type { Metadata } from "next";
import { EmailOutbox } from "@/features/admin/emails/EmailOutbox";

export const metadata: Metadata = { title: "Bandeja de salida" };

export default function AdminOutboxPage() {
  return <EmailOutbox />;
}
