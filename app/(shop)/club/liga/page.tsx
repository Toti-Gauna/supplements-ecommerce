import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { LeagueView } from "@/features/club/league/LeagueView";

export const metadata: Metadata = {
  title: `Liga de gimnasios · ${brand.club}`,
  description: `Elegí tu gimnasio de ${brand.city} y sumá puntos para su ranking del mes con compras, entrenos, misiones y Shaker Rush.`,
};

export default function LeaguePage() {
  return <LeagueView />;
}
