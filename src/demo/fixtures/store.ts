/**
 * Datos del local para la "ficha técnica" del pie. De MUESTRA: horarios inventados hasta que el cliente los confirme
 * (en producción salen de la tabla `Setting`, editables en el panel).
 */
export interface StoreHours {
  days: string;
  time: string;
}

export const storeHours: StoreHours[] = [
  { days: "Lunes a viernes", time: "9 a 20 h" },
  { days: "Sábados", time: "9 a 14 h" },
];

/** Se aclara en la ficha mientras los horarios no estén confirmados. */
export const storeHoursConfirmed = false;
