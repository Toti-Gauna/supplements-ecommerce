import type { PrizeKind } from "./wheel";

/**
 * Niveles del Club (MUESTRA). Se suben con lo gastado en pedidos pagados de los últimos 12 meses; los beneficios son
 * ilustrativos en la demo (en la tienda real los aplica el servidor). Cada nivel es una medalla de metal. Lo que es de
 * todos los socios (misiones, disco y Shaker Rush) va en `CLUB_BASE_PERKS`, no en un nivel. Montos en pesos.
 */
export type ClubLevelId = "novato" | "atleta" | "elite" | "bestia";
export type ClubMetal = "bronce" | "plata" | "oro" | "platino";

export interface ClubLevel {
  id: ClubLevelId;
  name: string;
  metal: ClubMetal;
  /** Desde cuánto gasto acumulado se llega al nivel. */
  minSpend: number;
  tagline: string;
  perks: string[];
}

export const CLUB_LEVELS: ClubLevel[] = [
  { id: "novato", name: "Novato", metal: "bronce", minSpend: 0, tagline: "Arrancás a cargar la barra.", perks: ["1 punto por cada $1.000 de compra", "Cupón del 10 % en tu cumpleaños"] },
  { id: "atleta", name: "Atleta", metal: "plata", minSpend: 50000, tagline: "Ya entrenás en serio.", perks: ["Sachet de muestra en cada pedido", "Cambio de talle sin cargo en guantes, vendas y cinturones"] },
  { id: "elite", name: "Élite", metal: "oro", minSpend: 150000, tagline: "Constancia de verdad.", perks: ["Envío gratis desde $40.000", "Acceso anticipado a lanzamientos y drops"] },
  { id: "bestia", name: "Bestia", metal: "platino", minSpend: 300000, tagline: "Modo bestia activado.", perks: ["5 % extra en cada stack", "Puntos del Club dobles", "Shaker edición Bestia de regalo"] },
];

/** Lo que tiene cualquier socio, desde el primer día: no es un beneficio de nivel. */
export const CLUB_BASE_PERKS = ["Misiones de compra y de entrenamiento", "Un giro del disco olímpico", "Shaker Rush con un cupón por día"];

/** Premio de una misión de entrenamiento: se entrega como cupón de un uso (mismo motor que la ruleta). */
export interface ClubPrize {
  kind: PrizeKind;
  value: number;
  validDays: number;
  minSubtotal?: number;
}

export type TrainingKind = "CHECKINS_WEEK" | "SPORT_DAY" | "GAME_WEEK";

/**
 * Misiones de entrenamiento (R2c): no son de compra. El registro es SIMULADO (nadie controla que vayas, como en tu
 * planilla del gimnasio) y cada premio se reclama una vez por período: semanal o una sola vez.
 */
export interface TrainingMission {
  id: string;
  title: string;
  description: string;
  kind: TrainingKind;
  threshold: number;
  period: "week" | "once";
  reward: string;
  prize: ClubPrize | null;
  /** Puntos del Club que suma al reclamarla. */
  points: number;
}

export const TRAINING_MISSIONS: TrainingMission[] = [
  { id: "t-entrenos", title: "Entrená 3 veces esta semana", description: "Marcá cada entreno, uno por día. La semana arranca el lunes.", kind: "CHECKINS_WEEK", threshold: 3, period: "week", reward: "Sachet de pre-entreno de regalo", prize: { kind: "FIXED", value: 2500, validDays: 14 }, points: 150 },
  { id: "t-deporte", title: "Probá un día del deporte", description: "Elegí un deporte que no hacés y anotate a una clase abierta.", kind: "SPORT_DAY", threshold: 1, period: "once", reward: "Envío gratis en tu próxima compra", prize: { kind: "FREE_SHIPPING", value: 0, validDays: 30 }, points: 100 },
  { id: "t-shaker", title: "Jugá Shaker Rush esta semana", description: "Con una partida alcanza: tu récord entra al ranking de la semana.", kind: "GAME_WEEK", threshold: 1, period: "week", reward: "+50 puntos del Club", prize: null, points: 50 },
];

/**
 * Lo que trae la cuenta demo (MUESTRA, como `demoAccountProgress`): lo gastado en el mes y los entrenos de la semana
 * antes de los que marques en este navegador.
 */
export const DEMO_CLUB_ACCOUNT = { spendMonth: 42000, checkinsWeek: 2 };

/** La cuenta demo (MUESTRA): la misma que crea el login simulado de Mi cuenta. */
export const DEMO_CLUB_USER = { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" };
