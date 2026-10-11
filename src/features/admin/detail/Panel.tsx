import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Tarjeta de una ficha: título, acción opcional a la derecha y contenido con aire (8.3.6). */
export function Panel({ title, action, children, className, id }: { title: string; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  const heading = id ?? `p-${title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={heading} className={cn("min-w-0 rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id={heading} className="text-lg font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Lista de datos etiqueta → valor que no corta palabras: en angosto, la etiqueta va arriba del valor. */
export function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[minmax(7rem,auto)_minmax(0,1fr)]">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted">{label}</dt>
          <dd className="mb-1 break-words font-semibold sm:mb-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
