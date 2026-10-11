"use client";
import { useState } from "react";
import { Breadcrumbs } from "@/components/templates/PageHeader";
import { GameHero } from "./GameHero";
import { GameHowTo } from "./GameHowTo";
import { GamePrizeTable } from "./GamePrizeTable";
import { GameStage } from "./GameStage";

/** Página del juego: inicio (cómo se juega y premios) y la partida a pantalla completa al tocar "Jugar". */
export function GameView() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <div className="flex flex-col gap-4">
        <Breadcrumbs crumbs={[{ href: "/club/", label: "Club" }]} />
        <GameHero onPlay={() => setPlaying(true)} />
      </div>
      <GameHowTo />
      <GamePrizeTable />
      {playing && <GameStage onClose={() => setPlaying(false)} />}
    </div>
  );
}
