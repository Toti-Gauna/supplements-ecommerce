"use client";
import { Select } from "@/components/atoms/Select";
import type { Product } from "@/demo/types";

type Names = Product["optionNames"];

/** Cómo se llaman las dos opciones en la tienda. Suplementos: sabor y tamaño; equipamiento: color y talle (o medida). */
const PRESETS: { id: string; label: string; names: Names }[] = [
  { id: "sabor", label: "Sabor y tamaño (suplementos)", names: undefined },
  { id: "talle", label: "Color y talle (cinturones, rodilleras, ropa)", names: { color: "Color", size: "Talle" } },
  { id: "medida", label: "Color y medida (guantes, sogas, botellas)", names: { color: "Color", size: "Medida" } },
];

const presetOf = (names: Names) => PRESETS.find((p) => p.names?.color === names?.color && p.names?.size === names?.size)?.id
  ?? (names?.color ? "talle" : "sabor");

export function OptionNamesField({ value, onChange }: { value: Names; onChange: (names: Names) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold">Qué elige el cliente
      <Select value={presetOf(value)} onChange={(e) => onChange(PRESETS.find((p) => p.id === e.target.value)?.names)}>
        {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
      </Select>
    </label>
  );
}
