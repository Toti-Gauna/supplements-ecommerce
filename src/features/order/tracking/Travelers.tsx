import type { ReactNode } from "react";
import { Decor, type DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { SeasonId } from "@/demo/types";
import { skinOf } from "@/features/themes/skins";
import { Courier } from "./Courier";
import { brand } from "@/config/brand";

/** Quién lleva el pedido por el recorrido: lo que se dibuja, cómo se nombra y qué estalla al llegar. */
export interface Traveler {
  node: ReactNode;
  label: string;
  /** Vuela (se mece arriba y abajo) en lugar de caminar o saltar. */
  motion: "fly" | "walk" | "hop" | "bob";
  burst: DecorKind[];
}

/** Con qué sale el cadete en cada fecha (lo dice el lector de pantalla). */
const OUTFIT: Record<SeasonId, string> = {
  "dia-de-la-madre": "con una flor", halloween: "con cuernitos", "cyber-monday": "con un chip en el casco",
  "black-friday": "con la etiqueta del Black Friday", navidad: "con gorro de Papá Noel", "ano-nuevo": "con gorro de fiesta",
  "san-valentin": "con un corazón", "vuelta-al-gym": "con su pesa rusa", "hot-sale": "a todo fuego", "dia-del-padre": "con su medalla",
  "dia-del-amigo": "con su shaker", "operacion-verano": "con el sol de la costa",
};

/**
 * El viajero del seguimiento según la temática (8.2.11): el cadete de VOLTA en bici, con la campera del color de la
 * fecha y su adorno sobre el casco. Sin temática (Original) no hay viajero: queda el punto de siempre.
 */
export function travelerFor(themeId: SeasonId | null): Traveler | null {
  if (!themeId) return null;
  const skin = skinOf(themeId);
  return {
    node: <Courier jacket={skin.accent} helmet={skin.to} hat={<Decor kind={skin.topper} className="h-full w-full" />} />,
    label: `el cadete de ${brand.mark}, ${OUTFIT[themeId]}`,
    motion: "walk",
    burst: skin.decor,
  };
}
