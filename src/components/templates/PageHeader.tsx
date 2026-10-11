import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <li><Link href="/" className="hover:underline">Inicio</Link></li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1">
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={c.href} className="hover:underline">{c.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, crumbs = [], children }: { title: string; crumbs?: Crumb[]; children?: ReactNode }) {
  return (
    <div className="mb-10">
      {crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}
      <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] text-ink">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-lg text-muted">{children}</div>}
    </div>
  );
}
