/** Montos en pesos enteros (ARS). Nunca decimales. */
const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0, minimumFractionDigits: 0 });

export function formatARS(amount: number): string {
  return ars.format(Math.round(amount)).replace(/ /g, " ");
}

/** Precio sin impuestos nacionales (Res. 4/2025). En la demo se calcula con IVA 21% de muestra. */
export function withoutNationalTaxes(amount: number, rate: number): number {
  return Math.round(amount / (1 + rate));
}
