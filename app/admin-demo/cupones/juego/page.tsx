import type { Metadata } from "next";
import { GamePrizesAdmin } from "@/features/admin/coupons/GamePrizesAdmin";

export const metadata: Metadata = { title: "Premios del juego" };

export default function AdminGamePrizesPage() {
  return <GamePrizesAdmin />;
}
