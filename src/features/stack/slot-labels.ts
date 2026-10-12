import type { StackSlotId } from "@/demo/fixtures/stack-builder";

/** Nombre corto de cada lugar (rótulos del estante y precio por servicio). */
export const SLOT_SHORT: Record<StackSlotId, string> = { base: "Base", creatina: "Crea", energia: "Pre", extra: "Extra" };

/** Número de lugar con dos cifras, como rótulo de laboratorio ("01"). */
export const slotNumber = (index: number) => String(index + 1).padStart(2, "0");
