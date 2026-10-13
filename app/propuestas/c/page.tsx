import type { Metadata } from "next";
import { ArenaProposal } from "@/features/propuestas/c/ArenaProposal";

export const metadata: Metadata = { title: "Propuesta C · Arena", robots: { index: false } };

export default function PropuestaCPage() {
  return <ArenaProposal />;
}
