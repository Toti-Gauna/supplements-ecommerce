import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { inputClass } from "./Field";

/** Select nativo (el navegador muestra su lista) con la estética de los campos de la tienda. */
export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, "font-semibold", props.className)} />;
}
