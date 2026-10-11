import type { Metadata } from "next";
import { GameView } from "@/features/game/GameView";

export const metadata: Metadata = {
  title: "Shaker Rush · Juego del Club",
  description: "Atrapá la energía, esquivá la chatarra y ganá un cupón por día según tu puntaje. 45 segundos, 3 vidas.",
};

export default function GamePage() {
  return <GameView />;
}
