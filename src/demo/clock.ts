import { DEMO_TODAY } from "./fixtures/admin-orders";

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" });

/**
 * "Ahora" en la demo: la hora real de Buenos Aires sobre el día fijo de la demo (`DEMO_TODAY`). Así un pedido, un
 * comprobante, un email o una nota que se crean al probar quedan fechados el mismo día que el resto de la demo, y no
 * el día real en que se muestra. En producción es la hora del servidor. `day` pone esa misma hora en otro día: la
 * vista previa de una campaña simula estar en su primer día (o en su sala de espera).
 */
export function demoNow(real: Date = new Date(), day: string = DEMO_TODAY): string {
  return new Date(`${day}T${clock.format(real)}-03:00`).toISOString();
}

/**
 * Reloj de las campañas en vivo (ms): el mismo que usa el modo automático de temáticas para elegir la fecha, así la
 * cuenta regresiva coincide con la campaña que se ve. La vista previa usa `demoNow(real, día de la campaña)`.
 */
export function shopNow(): number {
  return Date.now();
}
