/**
 * Plazo de despacho de lo que está en stock, en días hábiles. Vive solo (sin dependencias) para que los textos fijos
 * de la tienda (beneficios, preguntas frecuentes, metadatos, emails) prometan lo mismo que calcula el calendario de
 * despachos (`delivery.ts`). Si cambia el plazo, cambian todos los textos.
 */
export const READY_STOCK_DAYS: number = 1;

/** Cuándo sale lo que está en stock, para textos fijos: "Cadete en Mar del Plata al día hábil siguiente". */
export const DISPATCH_PROMISE = READY_STOCK_DAYS === 0 ? "en el día" : READY_STOCK_DAYS === 1 ? "al día hábil siguiente" : `en ${READY_STOCK_DAYS} días hábiles`;
