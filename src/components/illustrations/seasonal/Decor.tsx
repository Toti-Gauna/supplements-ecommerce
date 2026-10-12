import type { ComponentType } from "react";
import { Gift, Gloves, Heart, Medal, PulseHeart, Trophy, Flower } from "./awards";
import { Bag, Battery, Calendar, Chip, Flame, Tag, Update } from "./commerce";
import { Bolt, Dumbbell, Kettlebell, Plate, Scoop, ShakerCup, Sneaker, Spark, Stopwatch } from "./gym";
import { Bat, Firework, Horns, MusclePumpkin, Ornament, PartyHat, PlateTree, SantaHat, Snowflake } from "./holidays";
import type { DecorProps } from "./paint";
import { Bottle, Sun, Sunglasses, Wave } from "./summer";

/**
 * Decoraciones fitness de las temáticas (SVG propios con la estética de laboratorio de VOLTA: acero, goma negra,
 * voltio, plasma e ion). Se usan en el banner, la cinta, el logo, el fondo, la pantalla de carga y el Estudio.
 */
export const DECOR = {
  dumbbell: Dumbbell, kettlebell: Kettlebell, plate: Plate, shaker: ShakerCup, scoop: Scoop, bolt: Bolt, spark: Spark,
  stopwatch: Stopwatch, sneaker: Sneaker, medal: Medal, trophy: Trophy, heart: Heart, "pulse-heart": PulseHeart,
  gloves: Gloves, flower: Flower, gift: Gift, "muscle-pumpkin": MusclePumpkin, bat: Bat, horns: Horns,
  "santa-hat": SantaHat, ornament: Ornament, "plate-tree": PlateTree, snowflake: Snowflake, firework: Firework,
  "party-hat": PartyHat, tag: Tag, bag: Bag, flame: Flame, chip: Chip, battery: Battery, calendar: Calendar,
  update: Update, sun: Sun, wave: Wave, bottle: Bottle, sunglasses: Sunglasses,
} satisfies Record<string, ComponentType<DecorProps>>;

export type DecorKind = keyof typeof DECOR;

export function Decor({ kind, className }: { kind: DecorKind } & DecorProps) {
  const Component = DECOR[kind];
  return <Component className={className} />;
}
