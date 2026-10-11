import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface Crumb { href: string; label: string }
interface Props {
  /** Camino hasta la página actual, sin ella ("Marketing", "Cupones y ruleta"). */
  trail: Crumb[];
  title: string;
  /** Adónde vuelve "Volver a …": la entrada de la sección. */
  back: Crumb;
  intro?: ReactNode;
  actions?: ReactNode;
}

/** Encabezado de una subpágina (8.3.24): migas de pan, "Volver a [sección]" para elegir otra tarea, título y acciones. */
export function SubpageHeader({ trail, title, back, intro, actions }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-3">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link href={back.href} className="inline-flex items-center gap-1.5 font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> Volver a {back.label}</Link>
        <span aria-hidden="true" className="h-4 w-px bg-line" />
        <ol className="flex min-w-0 flex-wrap items-center gap-1 text-muted">
          {trail.map((c) => (
            <li key={c.href} className="flex items-center gap-1"><Link href={c.href} className="hover:text-ink hover:underline">{c.label}</Link><ChevronRight size={14} aria-hidden="true" /></li>
          ))}
          <li aria-current="page" className="font-semibold text-ink">{title}</li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-4xl sm:text-5xl">{title} <span className="align-middle font-sans text-sm font-bold text-warning">(demo)</span></h1>
          {intro && <p className="mt-1 max-w-2xl text-sm text-muted">{intro}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}

export const MARKETING: Crumb = { href: "/admin-demo/marketing/", label: "Marketing" };
