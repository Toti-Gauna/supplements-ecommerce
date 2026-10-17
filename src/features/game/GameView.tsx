"use client";
import { useState } from "react";
import { Breadcrumbs } from "@/components/templates/PageHeader";
import { GameHero } from "./GameHero";
import { GameHowTo } from "./GameHowTo";
import { GameLeaderboard } from "./GameLeaderboard";
import { GamePrizeTable } from "./GamePrizeTable";
import { GameStage } from "./GameStage";

/** Página del juego: inicio arcade, ranking de la semana, cómo se juega y premios; la partida va a pantalla completa. */
export function GameView() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      <div className="flex flex-col gap-4">
        <Breadcrumbs crumbs={[{ href: "/club/", label: "Club" }]} />
        <GameHero onPlay={() => setPlaying(true)} />
      </div>
      <div id="ranking" className="scroll-mt-28"><GameLeaderboard /></div>
      <GameHowTo />
      <GamePrizeTable />
      {playing && <GameStage onClose={() => setPlaying(false)} />}
    </div>
  );
}
