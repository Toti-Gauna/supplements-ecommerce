"use client";
import { useToasts } from "@/stores/toast";

/** Ejecuta un cambio del panel y avisa que vive solo en esta demo. */
export function useDemoSave() {
  const push = useToasts((s) => s.push);
  /** `run` devuelve false (transición inválida) o un texto con el motivo para avisar que no se aplicó. */
  return (title: string, run: () => boolean | string | void, note?: string) => {
    const ok = run();
    if (ok === false) return push({ tone: "error", title: "No se pudo aplicar", description: "Esa transición no corresponde al estado actual del pedido." });
    if (typeof ok === "string") return push({ tone: "error", title: "No se pudo aplicar", description: ok });
    push({ tone: "success", title, description: note ?? "Cambio guardado solo en esta demo (este navegador)." });
  };
}
