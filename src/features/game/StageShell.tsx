"use client";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./game.module.css";

const noop = () => () => {};
const FOCUSABLE = "a[href], button:not([disabled]), input, select, textarea, [tabindex='0']";

/**
 * Pantalla completa del juego: diálogo modal montado en <body> (campo al centro y, en pantallas anchas, columnas a
 * los lados), con el scroll de la página bloqueado (arrastrar el shaker nunca mueve la página), Tab atrapado adentro y
 * el foco de vuelta en "Jugar" al salir. Escape no cierra: lo usa el juego para pausar.
 */
export function StageShell({ label, children }: { label: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  useEffect(() => {
    if (!mounted) return;
    const previous = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    html.classList.add("stage-open");
    root.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !root.current) return;
      const items = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !active || active === root.current || !root.current.contains(active);
      if (outside) { e.preventDefault(); (e.shiftKey ? last : first)?.focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = "";
      html.classList.remove("stage-open");
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [mounted]);
  if (!mounted) return null;
  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
      className={`${styles.arena} fixed inset-0 z-[80] flex justify-center overscroll-none text-on-night outline-none [&_:focus-visible]:outline-volt-soft`}>
      {children}
    </div>,
    document.body,
  );
}
