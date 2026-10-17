"use client";
import type { ReactNode } from "react";
import type { Gift } from "@/demo/engine/gifts";
import { AthleteCard } from "./scenes/reveal/AthleteCard";

interface Props {
  gift: Gift;
  saved: boolean;
  preview: boolean;
  onSave: () => void;
  onReplay: () => void;
  /** R3b: el selector de sabor o tamaño cuando quedó abierto (lo arma quien conecta el regalo). */
  choice?: ReactNode;
}

/**
 * Lo que había adentro (se mantiene el nombre y las props de siempre). Desde R3b es la "tarjeta de atleta" sobre un
 * estudio neutro, con "cómo tomarlo", el mensaje, "Guardá tu regalo" y "Compartí en tu historia".
 */
export function GiftCard(props: Props) {
  return <AthleteCard {...props} />;
}
