import { motion } from "motion/react";
import { CONTAINERS, FRAME_SCALE, defaultPack, type PackStyle } from "@/components/illustrations/supplements";
import type { StackSlotId } from "@/demo/fixtures/stack-builder";
import type { ArtKey } from "@/demo/types";
import { BAY_X, FLOOR, type ShelfIds } from "./ShelfScene";

/** Lo que muestra un lugar del estante: el envase del producto con el color del sabor elegido. */
export interface ShelfItem {
  slot: StackSlotId;
  /** Cambia con el producto o la variante: el envase viejo sale y entra el nuevo. */
  key: string;
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
  name: string;
}

/** Escala de los envases en el estante (sobre la que normaliza la librería para llenar un cuadro de 400). */
const POT_SCALE = 0.6;
/** Silueta punteada de cada lugar vacío (ancho y alto del cuerpo, alto de la tapa). */
const SILHOUETTE: Record<StackSlotId, [number, number, number]> = { base: [112, 146, 26], creatina: [86, 104, 22], energia: [86, 104, 22], extra: [70, 118, 18] };

const at = (cx: number, s: number) => `translate(${cx} ${FLOOR}) scale(${s}) translate(-200 -330)`;

/** Cono de luz de un lugar: prendido si tiene algo, casi apagado si está vacío. Va detrás de la repisa. */
export function ShelfCone({ index, lit, ids, reduce }: { index: number; lit: boolean; ids: ShelfIds; reduce: boolean }) {
  const cx = BAY_X[index]!;
  return (
    <motion.path d={`M${cx - 24} 27H${cx + 24}L${cx + 94} ${FLOOR}H${cx - 94}Z`} fill={`url(#${ids.cone})`}
      initial={false} animate={{ opacity: lit ? 1 : 0.14 }} transition={{ duration: reduce ? 0 : 0.6 }} />
  );
}

/** Un envase que cae a su lugar con un rebote corto y un fogonazo de luz en la repisa. */
export function ShelfPot({ index, item, ids, reduce }: { index: number; item: ShelfItem; ids: ShelfIds; reduce: boolean }) {
  const cx = BAY_X[index]!;
  const Container = CONTAINERS[item.art] ?? CONTAINERS.tub;
  const delay = reduce ? 0 : index * 0.1;
  return (
    <motion.g data-shelf-pot={item.slot} exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -26, transition: { duration: 0.24 } }}>
      <motion.ellipse cx={cx} cy={FLOOR + 1} rx="86" ry="13" fill={`url(#${ids.pool})`}
        initial={reduce ? false : { opacity: 0 }} animate={{ opacity: reduce ? 0.5 : [0, 1, 0.5] }} transition={{ duration: 0.9, delay: delay + 0.2, times: [0, 0.3, 1] }} />
      <motion.ellipse cx={cx} cy={FLOOR + 1} rx="62" ry="6" fill="url(#sp-shadow)"
        initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: delay + 0.1 }} />
      <motion.g initial={reduce ? false : { opacity: 0, y: -110 }} animate={{ opacity: 1, y: 0 }}
        transition={{ y: { type: "spring", stiffness: 260, damping: 16, delay }, opacity: { duration: 0.25, delay } }}>
        <g transform={at(cx, (FRAME_SCALE[item.art] ?? 1) * POT_SCALE)}>
          <Container pack={item.pack ?? defaultPack(item.art)} tint={item.tint ?? "#8b72ff"} />
        </g>
      </motion.g>
    </motion.g>
  );
}

/** Lugar vacío: la silueta punteada de un envase con un "+" (invita a sumar algo). */
export function ShelfSilhouette({ index, slot, reduce }: { index: number; slot: StackSlotId; reduce: boolean }) {
  const cx = BAY_X[index]!;
  const [w, h, lid] = SILHOUETTE[slot];
  const line = { fill: "#fff", fillOpacity: 0.025, stroke: "#eef1f5", strokeOpacity: 0.32, strokeWidth: 2, strokeDasharray: "7 7" };
  return (
    <motion.g data-shelf-empty={slot} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }} transition={{ duration: 0.35, delay: 0.1 }}>
      <rect x={cx - w / 2} y={FLOOR - h} width={w} height={h} rx="12" {...line} />
      <rect x={cx - w / 2 - 5} y={FLOOR - h - lid - 3} width={w + 10} height={lid} rx="6" {...line} />
      <path d={`M${cx - 11} ${FLOOR - h / 2}h22M${cx} ${FLOOR - h / 2 - 11}v22`} stroke="#eef1f5" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
  );
}
