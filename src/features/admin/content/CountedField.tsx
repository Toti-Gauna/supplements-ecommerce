"use client";
import { useId } from "react";
import { Input, Textarea } from "@/components/atoms/Field";
import { cn } from "@/lib/cn";

interface Props { label: string; value: string; max: number; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }

/**
 * Campo de texto con contador (8.3.28): se puede escribir o pegar de más, pero el contador avisa en rojo y guardar
 * muestra el error, en vez de cortar el texto sin decir nada.
 */
export function CountedField({ label, value, max, onChange, multiline, placeholder }: Props) {
  const id = useId();
  const n = [...value.trim()].length;
  const over = n > max;
  const props = { id, value, placeholder, "aria-describedby": `${id}-count`, "aria-invalid": over || undefined };
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      {multiline ? <Textarea {...props} rows={2} className="min-h-20" onChange={(e) => onChange(e.target.value)} /> : <Input {...props} onChange={(e) => onChange(e.target.value)} />}
      <span id={`${id}-count`} className={cn("self-end text-xs font-semibold tabular-nums", over ? "text-danger" : "text-muted")}>{over ? `${n} de ${max}: sobran ${n - max}` : `${n} de ${max}`}</span>
    </div>
  );
}
