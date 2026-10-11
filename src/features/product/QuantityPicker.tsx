"use client";
import { useId } from "react";

interface Props { value: number; max: number; note: string; onChange: (n: number) => void }

/**
 * Cantidad al estilo de las grandes tiendas: "Cantidad: 1 unidad ⌄ (7 disponibles)". Es un <select> nativo:
 * en el celular abre la rueda/lista del sistema, con la estética de la tienda.
 */
export function QuantityPicker({ value, max, note, onChange }: Props) {
  const id = useId();
  const options = Array.from({ length: Math.max(1, Math.min(max, 10)) }, (_, i) => i + 1);
  const unit = (n: number) => `${n} ${n === 1 ? "unidad" : "unidades"}`;
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-bg px-4 py-1.5 text-[15px] transition-colors focus-within:ring-2 focus-within:ring-primary/30 hover:bg-accent/50">
      <label htmlFor={id} className="shrink-0">Cantidad:</label>
      <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="min-h-10 min-w-0 flex-1 rounded-xl bg-transparent pl-1 font-bold text-ink focus:outline-none">
        {options.map((n) => <option key={n} value={n}>{unit(n)}</option>)}
      </select>
      <span className="shrink-0 text-sm text-muted">{note}</span>
    </div>
  );
}
