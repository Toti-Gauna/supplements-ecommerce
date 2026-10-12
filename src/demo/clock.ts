import { DEMO_TODAY } from "./fixtures/admin-orders";

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" });

/**
 * "Ahora" en la demo: la hora real de Buenos Aires sobre el día fijo de la demo (`DEMO_TODAY`). Así un pedido, un
 * comprobante, un email o una nota que se crean al probar quedan fechados el mismo día que el resto de la demo, y no
 * el día real en que se muestra. En producción es la hora del servidor.
 */
export function demoNow(real: Date = new Date()): string {
  return new Date(`${DEMO_TODAY}T${clock.format(real)}-03:00`).toISOString();
}
