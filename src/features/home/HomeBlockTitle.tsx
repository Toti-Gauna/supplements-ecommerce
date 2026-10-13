import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  id: string;
  /** Número de carril (orden del bloque en el inicio). */
  n: number;
  kicker: string;
  title: string;
  action?: { href: string; label: string };
  /** Controles a la derecha (flechas de un riel). */
  children?: ReactNode;
}

/** Rótulo de bloque del inicio, pintado como en el piso del box: número de carril, titular y marca de carril abajo. */
export function HomeBlockTitle({ id, n, kicker, title, action, children }: Props) {
  return (
    <div className="lane mb-5 flex items-end justify-between gap-4 pb-3">
      <div className="flex min-w-0 items-end gap-3">
        <span aria-hidden="true" className="font-display text-4xl font-black leading-none text-volt-ink sm:text-5xl">{String(n).padStart(2, "0")}</span>
        <div className="min-w-0">
          <p className="eyebrow text-muted">{kicker}</p>
          <h2 id={id} className="font-display mt-1 text-3xl leading-none sm:text-4xl">{title}</h2>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
      {action && (
        <Link href={action.href} className="inline-flex min-h-11 shrink-0 items-center gap-1 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-volt-ink hover:underline">
          {action.label} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      )}
      {children}
      </div>
    </div>
  );
}
