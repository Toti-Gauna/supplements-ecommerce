/**
 * Niveles del Club VOLTA (MUESTRA). Se suben con lo gastado en pedidos pagados de los últimos 12 meses; los beneficios
 * son ilustrativos en la demo (en la tienda real los aplica el servidor). Montos en pesos enteros.
 */
export type ClubLevelId = "novato" | "atleta" | "elite" | "bestia";

export interface ClubLevel {
  id: ClubLevelId;
  name: string;
  /** Desde cuánto gasto acumulado se llega al nivel. */
  minSpend: number;
  tagline: string;
  perks: string[];
}

export const CLUB_LEVELS: ClubLevel[] = [
  { id: "novato", name: "Novato", minSpend: 0, tagline: "Arrancás a cargar la batería.", perks: ["Misiones y ruleta", "Shaker Rush con premio diario"] },
  { id: "atleta", name: "Atleta", minSpend: 50000, tagline: "Ya entrenás en serio.", perks: ["Sachet de muestra en cada pedido", "Avisos de recompra por WhatsApp"] },
  { id: "elite", name: "Élite", minSpend: 150000, tagline: "Constancia de verdad.", perks: ["Envío gratis desde $40.000", "Acceso anticipado a lanzamientos"] },
  { id: "bestia", name: "Bestia", minSpend: 300000, tagline: "Modo bestia activado.", perks: ["5 % extra en cada stack", "Shaker edición Bestia de regalo"] },
];
