import type { Metadata } from "next";
import { ClubView } from "@/features/club/ClubView";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: brand.club, description: "Misiones, premios y ruleta de cupones." };

export default function ClubPage() {
  return <ClubView />;
}
