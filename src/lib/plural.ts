/** Cantidad con su sustantivo en singular o plural: `plural(1, "producto", "productos")` → "1 producto". */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
