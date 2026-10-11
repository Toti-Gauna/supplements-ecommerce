"use client";
import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Nombre del diálogo para el lector de pantalla. */
  label: string;
  /** Colores de la luz de fondo (los de la temática). */
  glow?: [string, string];
  /** Texto del botón de salida (arriba a la derecha). */
  exitLabel?: string;
  /** Oculta el botón de salida (por ejemplo, mientras gira la ruleta). */
  lockExit?: boolean;
  children: ReactNode;
  className?: string;
}

const noop = () => () => {};

/**
 * Escenario a pantalla completa: todo se oscurece y queda solo lo protagonista (la ruleta, el regalo). No es una
 * ventana con marco: ocupa la pantalla entera y entra sin scroll. Accesible como diálogo: foco atrapado, Escape
 * sale, scroll de fondo bloqueado y el foco vuelve a donde estaba. Se monta en <body> por portal.
 */
export function ImmersiveStage({ open, onClose, label, glow = ["#3d4a2a", "#c9a77a"], exitLabel = "Salir", lockExit, children, className }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const closeRef = useRef(onClose);
  const lockRef = useRef(lockExit);
  useEffect(() => { closeRef.current = onClose; lockRef.current = lockExit; }, [onClose, lockExit]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    html.classList.add("stage-open");
    // El foco entra al diálogo (sin anillo visible al tocar); Tab recorre los botones. Si ya está adentro (alguien
    // llegó antes con Tab o con un toque), no se lo saca.
    const t = window.setTimeout(() => {
      if (root.current?.contains(document.activeElement)) return;
      (root.current?.querySelector<HTMLElement>("[data-autofocus]") ?? root.current)?.focus({ preventScroll: true });
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      // Un Escape ya usado (el que cierra la pantalla de carga) no saca del escenario.
      if (e.key === "Escape" && !e.defaultPrevented && !lockRef.current) closeRef.current();
      if (e.key !== "Tab" || !root.current) return;
      const items = [...root.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea, [tabindex='0']")];
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      // Si el foco quedó en el escenario mismo o se cayó al <body> (un botón que se desmontó o se deshabilitó),
      // Tab vuelve adentro en vez de escaparse a la página de atrás.
      const outside = !active || active === root.current || !root.current.contains(active);
      if (outside) { e.preventDefault(); (e.shiftKey ? last : first)?.focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      html.style.overflow = "";
      html.classList.remove("stage-open");
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);
  if (!mounted || !open) return null;
  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
      style={{ "--glow-a": glow[0], "--glow-b": glow[1] } as CSSProperties}
      className={cn("immersive-stage fixed inset-0 z-[80] flex flex-col overflow-hidden text-[#f6f1e8] outline-none", className)}>
      <div aria-hidden="true" className="immersive-backdrop absolute inset-0" />
      {!lockExit && (
        <button type="button" onClick={onClose}
          className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-20 flex h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-bold text-[#f6f1e8] ring-1 ring-white/15 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6f1e8]">
          <X size={18} aria-hidden="true" /> {exitLabel}
        </button>
      )}
      {/* Con el celular apaisado puede no entrar: se scrollea adentro del escenario (centrado con márgenes automáticos
          para que no se corte arriba). */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))]">
        <div className="my-auto flex w-full flex-col items-center">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
