import type { Goal } from "../types";

/**
 * Fichas de clientes del panel (Fase 6): objetivo, notas, cumpleaños y avisos de recompra ya mandados. Todo FICTICIO.
 * También el consumo de referencia por categoría con el que se calcula cuándo se le termina cada pote.
 */

export interface CustomerNote {
  at: string;
  text: string;
}

export type NoticeChannel = "email" | "whatsapp";

/** Aviso de recompra ya mandado desde el panel: uno por pote (si vuelve a comprar, el pote nuevo tiene otra clave). */
export interface RepurchaseNotice {
  /** `${slug}:${AAAA-MM-DD en que se termina}`. */
  key: string;
  at: string;
  channel: NoticeChannel;
}

export interface CustomerProfile {
  notes: CustomerNote[];
  /** Cumpleaños del cliente, MM-DD. */
  birthday?: string;
  /** Objetivo que eligió el cliente (o que cargó el local). Sin esto, se deduce de lo que compra. */
  goal?: Goal;
  notices?: RepurchaseNotice[];
  /** Regalo de cumpleaños ya armado (R4c): uno por año. */
  birthdayGift?: { year: number; code: string; at: string };
}

/** Fichas FICTICIAS por email (en minúsculas). Notas y fechas inventadas. */
export const customerProfiles: Record<string, CustomerProfile> = {
  "diego.a@ejemplo.com": { notes: [{ at: "2026-09-29T10:00:00-03:00", text: "Prefiere que le escriban por WhatsApp a la tarde." }] },
  "julian.p@ejemplo.com": { notes: [], birthday: "01-15", goal: "salud" },
  "vale.s@ejemplo.com": { notes: [{ at: "2026-09-28T09:30:00-03:00", text: "Le llegó un pote con el precinto roto: ofrecerle un cupón en la próxima." }], birthday: "11-12", goal: "definicion" },
  "martin.g@ejemplo.com": { notes: [] },
  "lucia.f@ejemplo.com": { notes: [], birthday: "10-30", goal: "masa-muscular" },
  "juan.i@ejemplo.com": { notes: [{ at: "2026-09-07T10:30:00-03:00", text: "Toma un scoop después de entrenar, todos los días. Siempre chocolate." }], goal: "masa-muscular" },
  "flor.m@ejemplo.com": { notes: [], goal: "definicion" },
  "nico.r@ejemplo.com": { notes: [], goal: "masa-muscular" },
  "tomas.h@ejemplo.com": { notes: [{ at: "2026-08-12T19:00:00-03:00", text: "Entrena fuerza cuatro veces por semana a la noche." }], goal: "fuerza" },
  "paula.c@ejemplo.com": { notes: [], goal: "recuperacion" },
};

/**
 * Servicios por semana que se suponen para calcular cuándo se termina un envase (orientativo, como la calculadora de
 * la ficha). Uno por día salvo lo que se toma solo los días de entrenamiento. Una categoría que no está acá (accesorios)
 * no tiene recompra.
 */
export const servingsPerWeek: Record<string, number> = {
  proteinas: 7,
  ganadores: 7,
  creatinas: 7,
  "pre-entrenos": 4,
  aminoacidos: 4,
  definicion: 7,
  salud: 7,
  snacks: 7,
  hidratacion: 3,
};

/** Presentaciones más chicas que esto (una barra suelta, una caja de 6 geles) no se siguen: no son "un pote". */
export const MIN_TRACKED_SERVINGS = 10;
