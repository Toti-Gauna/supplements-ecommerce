import type { Mission } from "../types";

/**
 * Alta y edición de misiones (8.3.23): mismos tipos y reglas que antes. Solo misiones de compra (sin referidos); solo
 * cuentan pedidos pagados y el premio es de un uso con vencimiento (eso lo aplica el engine al completar).
 */
export const MISSION_TYPES: { value: Mission["type"]; label: string; unit: string }[] = [
  { value: "UNITS_COUNT", label: "Cantidad de productos", unit: "unidades" },
  { value: "ORDERS_COUNT", label: "Cantidad de pedidos", unit: "pedidos" },
  { value: "SPEND_TOTAL", label: "Monto acumulado", unit: "ARS" },
];

export const emptyMission = (id: string): Mission => ({ id, title: "", description: "", type: "UNITS_COUNT", threshold: 3, reward: "", active: true, nextMissionId: null, completedCount: 0 });

export const newMissionId = () => `m-${Date.now().toString(36)}`;

export function checkMission(m: Mission): Record<string, string> {
  const errors: Record<string, string> = {};
  if (m.title.trim().length < 3) errors.title = "Escribí un título (3 letras o más).";
  if (m.reward.trim().length < 3) errors.reward = "Escribí qué gana el cliente (3 letras o más).";
  if (!Number.isInteger(m.threshold) || m.threshold < 1) errors.threshold = "El umbral tiene que ser un número entero mayor a 0.";
  return errors;
}
