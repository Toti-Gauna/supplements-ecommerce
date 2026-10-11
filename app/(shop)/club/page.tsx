import type { Metadata } from "next";
import { ClubView } from "@/features/club/ClubView";

export const metadata: Metadata = { title: "Club Volta", description: "Misiones, premios y ruleta de cupones." };

export default function ClubPage() {
  return <ClubView />;
}
