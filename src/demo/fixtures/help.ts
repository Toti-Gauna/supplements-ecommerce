import type { FaqTopic } from "../types";

/**
 * Ayuda del box (R2c): los temas en que se agrupan las preguntas frecuentes, en el orden de la página, y las palabras
 * que delatan el tema de una pregunta que no lo tiene (preguntas guardadas antes de v16). Textos de MUESTRA.
 */
export interface FaqTopicInfo {
  id: FaqTopic;
  label: string;
  /** Bajada corta del grupo. */
  hint: string;
  /** Raíces (sin tildes, en minúscula) que llevan una pregunta sin tema a este grupo. */
  keywords: string[];
}

export const FAQ_TOPICS: FaqTopicInfo[] = [
  { id: "compras", label: "Compras", hint: "Cuenta, marcas, stack y avisos", keywords: ["cuenta", "marca", "comprar", "stack", "rack", "compar"] },
  { id: "envios", label: "Envíos y cadete", hint: "Cuándo llega y cómo seguirlo", keywords: ["llega", "envio", "cadete", "retir", "seguimiento", "segui", "entrega"] },
  { id: "pagos", label: "Pagos", hint: "Medios, cuotas y comprobantes", keywords: ["pagar", "pago", "cuotas", "tarjeta", "transferencia", "comprobante"] },
  { id: "cambios", label: "Cambios y devoluciones", hint: "Arrepentimiento, cambios y garantía", keywords: ["arrepient", "cambi", "devol", "danad", "roto"] },
  { id: "suplementos", label: "Suplementos y lotes", hint: "Originales, lotes, vencimientos y cómo elegir", keywords: ["original", "lote", "vencim", "creatina", "whey", "proteina", "conviene", "suplement"] },
  { id: "equipamiento", label: "Equipamiento y talles", hint: "Guantes, cinturones, rodilleras y straps", keywords: ["talle", "guante", "cinturon", "rodillera", "strap", "onzas", "equipamiento", "garantia"] },
  { id: "club", label: "Club y regalos", hint: "Niveles, juego y regalos", keywords: ["club", "nivel", "regal", "shaker rush", "ruleta", "puntos", "cupon"] },
];

/** Tema de las preguntas que no encajan en ninguno. */
export const FALLBACK_FAQ_TOPIC: FaqTopic = "compras";
