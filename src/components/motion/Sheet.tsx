"use client";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "right" | "left" | "bottom" | "center" | "top" | "dialog";
  children: ReactNode;
  className?: string;
}

const noop = () => () => {};
const OFFSET = { right: { x: "100%" }, left: { x: "-100%" }, bottom: { y: "100%" }, top: { y: "-100%" }, center: { opacity: 0, scale: 0.94, y: 20 }, dialog: { opacity: 0, scale: 0.96, y: 24 } };
// Filo de luz del lado por donde entra (acento de temporada; sin fecha, el color firma).
const PLACE = {
  right: "inset-y-0 right-0 w-full max-w-md border-l border-line [box-shadow:inset_2px_0_0_var(--season-accent),var(--shadow-lift)]",
  left: "inset-y-0 left-0 w-full max-w-sm border-r border-line [box-shadow:inset_-2px_0_0_var(--season-accent),var(--shadow-lift)]",
  bottom: "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-sm border-t border-line [box-shadow:inset_0_2px_0_var(--season-accent),var(--shadow-lift)]",
  top: "shadow-[var(--shadow-lift)] inset-x-0 top-0 max-h-[100dvh] rounded-b-sm sm:mx-auto sm:mt-4 sm:max-h-[88dvh] sm:w-[min(94vw,760px)] sm:rounded-sm",
  center: "shadow-[var(--shadow-lift)] inset-0 m-auto h-fit max-h-[94dvh] w-[min(94vw,540px)] overflow-y-auto rounded-sm",
  // Modal ancho y centrado; en el celular ocupa el ancho y sube desde abajo, con su propio scroll.
  dialog: "shadow-[var(--shadow-lift)] inset-x-0 bottom-0 max-h-[94dvh] overflow-hidden rounded-t-sm sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[90dvh] sm:w-[min(94vw,920px)] sm:rounded-sm",
};

/**
 * Panel modal accesible: foco atrapado, Escape cierra, scroll de fondo bloqueado, devuelve el foco.
 * Se monta en <body> por portal: un ancestro con backdrop-filter (el header) recortaría un `fixed`.
 */
export function Sheet({ open, onClose, title, side = "right", children, className }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  // onClose suele ser una función nueva en cada render: se guarda en un ref para que el efecto
  // de foco/scroll dependa solo de `open` (si no, cada tecla devolvía el foco al botón que abrió).
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const t = window.setTimeout(() => (panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>("button, a, input"))?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea, [tabindex='0']")];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(t); html.style.overflow = ""; document.removeEventListener("keydown", onKey); previous?.focus?.(); };
  }, [open]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div className="absolute inset-0 bg-night/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose} />
          <motion.div ref={panel} role="dialog" aria-modal="true" aria-label={title}
            className={cn("absolute flex flex-col bg-bg", /\bmax-w-/.test(className ?? "") ? PLACE[side].replace(/ max-w-\S+/g, "") : PLACE[side], className)}
            initial={OFFSET[side]} animate={{ x: 0, y: 0, opacity: 1, scale: 1 }} exit={OFFSET[side]} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="bevel absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-xs border border-line bg-surface text-ink hover:bg-accent">
              <X size={20} aria-hidden="true" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
