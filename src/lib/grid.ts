/**
 * Columnas para repartir `n` elementos en filas parejas con hasta `max` por fila: las menos filas posibles y, si la
 * última quedara con uno solo, una columna más o una menos (así ninguno queda solo en su fila). Si ninguna de las
 * dos sirve (con 3 por fila pasa recién con 13), queda la cuenta pareja.
 */
export function balancedColumns(n: number, max: number) {
  if (n <= 1) return 1;
  const base = Math.ceil(n / Math.ceil(n / max));
  const fits = (cols: number) => cols >= 2 && cols <= max + 1 && (n <= cols || n % cols !== 1);
  return [base, base + 1, base - 1].find(fits) ?? base;
}
