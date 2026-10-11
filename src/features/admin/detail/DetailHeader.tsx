"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useBackHref } from "../listReturn";

interface Props {
  /** Lista de la que viene la ficha ("/admin-demo/pedidos/") y su nombre. */
  list: { href: string; label: string };
  /** ID visible (VEL-000123, el nombre del cliente…). */
  title: string;
  eyebrow?: string;
  /** Estados (chips) debajo del título. */
  status?: ReactNode;
  /** Dato destacado a la derecha (total, monto). */
  aside?: ReactNode;
  actions?: ReactNode;
}

/**
 * Encabezado de las fichas completas (8.3.5): migas de pan, Volver (a la lista con sus filtros y página), ID, estado y
 * acciones. El título lleva la marca "(demo)" como el resto del panel.
 */
export function DetailHeader({ list, title, eyebrow, status, aside, actions }: Props) {
  const back = useBackHref(list.href);
  return (
    <header className="flex flex-col gap-3">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link href={back} className="inline-flex items-center gap-1.5 font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> Volver</Link>
        <span aria-hidden="true" className="h-4 w-px bg-line" />
        <ol className="flex min-w-0 items-center gap-1 text-muted">
          <li><Link href={back} className="hover:text-ink hover:underline">{list.label}</Link></li>
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          <li aria-current="page" className="truncate font-semibold text-ink">{title}</li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow text-muted">{eyebrow}</p>}
          <h1 className="font-display mt-1 break-words text-4xl sm:text-5xl">{title} <span className="align-middle font-sans text-sm font-bold text-warning">(demo)</span></h1>
          {status && <div className="mt-3 flex flex-wrap items-center gap-2">{status}</div>}
        </div>
        {aside && <div className="text-right">{aside}</div>}
      </div>
      {actions}
    </header>
  );
}

/** Chip de estado con nombre ("Pago: …") para no depender solo del color. */
export function TrackChip({ label, value, tone }: { label: string; value: string; tone: "neutral" | "warning" | "success" | "danger" | "brand" }) {
  const TONE = { neutral: "bg-accent text-ink", warning: "bg-warning-soft text-warning", success: "bg-success-soft text-success", danger: "bg-danger-soft text-danger", brand: "bg-primary/10 text-primary" };
  return (
    <span className={`inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 rounded-2xl px-3 py-1 text-sm ${TONE[tone]}`}>
      <span className="whitespace-nowrap font-semibold opacity-80">{label}:</span><strong>{value}</strong>
    </span>
  );
}
