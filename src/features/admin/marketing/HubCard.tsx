import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

interface Props { href: string; icon: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" }>; title: string; description: string; meta?: ReactNode; action?: string }

/**
 * Tarjeta de entrada a una tarea (8.3.24): título, una línea de descripción y una acción clara. Toda la tarjeta es el
 * enlace (teclado y táctil), y abre una subpágina con su propia ruta.
 */
export function HubCard({ href, icon: Icon, title, description, meta, action = "Abrir" }: Props) {
  return (
    <li className="flex">
      <Link href={href} className="group flex w-full flex-col gap-3 rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <span className="flex items-start gap-3">
          <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-primary"><Icon size={20} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-extrabold leading-snug">{title}</span>
            <span className="mt-0.5 block text-sm text-muted">{description}</span>
          </span>
        </span>
        {meta && <span className="text-sm font-semibold text-ink/80">{meta}</span>}
        <span className="mt-auto inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary">{action} <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" /></span>
      </Link>
    </li>
  );
}

export function HubGrid({ label, children }: { label: string; children: ReactNode }) {
  return <ul aria-label={label} className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>;
}
