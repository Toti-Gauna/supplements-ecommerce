import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Input } from "./Field";

/**
 * Fecha con el calendario nativo del sistema y la estética de la tienda. En Safari de iPhone/iPad el campo
 * vacío no muestra nada: ahí se ve "dd/mm/aaaa" encima (ver `.date-placeholder` en globals.css).
 */
export function DateInput({ className, placeholder = "dd/mm/aaaa", ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span className="relative block min-w-0">
      <Input type="date" {...props} className={cn("w-full", className)} />
      {!props.value && <span aria-hidden="true" className="date-placeholder pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted/70">{placeholder}</span>}
    </span>
  );
}
