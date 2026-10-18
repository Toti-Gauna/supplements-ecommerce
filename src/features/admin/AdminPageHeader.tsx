"use client";
import { CircleHelp } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Sheet } from "@/components/motion/Sheet";

/**
 * Encabezado compacto de cada pantalla del panel (R4a): el título y, si hay explicación, un botón "?" que la abre en un
 * panel. Las pantallas ya no abren con un párrafo largo.
 */
export function AdminPageHeader({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        {children && (
          <button type="button" onClick={() => setOpen(true)} aria-label={`Ayuda: ${title}`} aria-haspopup="dialog" aria-expanded={open}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-primary">
            <CircleHelp size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      {actions}
      {children && (
        <Sheet open={open} onClose={() => setOpen(false)} title={`Ayuda: ${title}`} labelledBy={titleId} side="right" className="bg-surface">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-6 pr-16">
            <h2 id={titleId} className="font-display text-2xl">{title}</h2>
            <div className="text-[15px] leading-relaxed text-ink/85">{children}</div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
