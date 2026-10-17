import type { Subscription } from "../engine/subscriptions";
import { ORDER_PREFIX } from "./house";

/**
 * Suscripciones de MUESTRA para el panel (clientes inventados): así "Suscripciones" no arranca vacío en la demo. Mi cuenta
 * no las muestra (`seed`): son de otras personas. Variantes sin elegir = la primera con stock.
 */
export const seedSubscriptions: Subscription[] = [
  { id: "sub-seed-1", packId: "hipertrofia", choices: {}, day: 10, status: "active", startedOn: "2026-08-10", orderCode: `${ORDER_PREFIX}-000098`, skipNext: false, customer: "Julián Paz", seed: true },
  { id: "sub-seed-2", packId: "salud", choices: {}, day: 18, status: "active", startedOn: "2026-07-18", orderCode: `${ORDER_PREFIX}-000081`, skipNext: true, customer: "Valentina Sosa", seed: true },
  { id: "sub-seed-3", packId: "running", choices: {}, day: 7, status: "paused", startedOn: "2026-09-07", orderCode: `${ORDER_PREFIX}-000110`, skipNext: false, customer: "Camila Torres", seed: true },
  { id: "sub-seed-4", packId: "futbol", choices: {}, day: 25, status: "active", startedOn: "2026-09-25", orderCode: `${ORDER_PREFIX}-000112`, skipNext: false, customer: "Diego Álvarez", seed: true },
];
