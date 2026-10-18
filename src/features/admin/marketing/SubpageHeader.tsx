import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { AdminPageHeader } from "../AdminPageHeader";

interface Props {
  title: string;
  /** Solo en pantallas que no son una pestaña (editor y piezas de una campaña): adónde vuelve “Volver a …”. */
  back?: { href: string; label: string };
  intro?: ReactNode;
  actions?: ReactNode;
}

/** Encabezado de una pantalla de herramienta: título con ayuda en “?”, acciones y, si hace falta, un “Volver a …”. */
export function SubpageHeader({ title, back, intro, actions }: Props) {
  return (
    <>
      {back && <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> Volver a {back.label}</Link>}
      <AdminPageHeader title={title} actions={actions}>{intro}</AdminPageHeader>
    </>
  );
}
