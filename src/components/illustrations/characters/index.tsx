import { Lola } from "./Lola";
import { Pancho } from "./Pancho";
import type { PupProps } from "./types";

export type { PupOutfit, PupPose, PupProps } from "./types";
export { Lola, Pancho };

/** Elenco: Pancho (salchicha) y Lola (caniche). Ver app/characters.css para las animaciones. */
export const CAST = { pancho: Pancho, lola: Lola } as const;
export type CastId = keyof typeof CAST;

export function VoltaPup({ who, ...props }: PupProps & { who: CastId }) {
  const Character = CAST[who];
  return <Character {...props} />;
}
