import { withBase } from "@/lib/base-path";

/** Link completo a la tienda (con el dominio y el basePath de Pages) para mandar por WhatsApp. Solo en el navegador. */
export function shopUrl(path: string): string {
  return typeof window === "undefined" ? withBase(path) : `${window.location.origin}${withBase(path)}`;
}
