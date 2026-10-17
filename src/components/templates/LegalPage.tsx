import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LegalSection } from "@/demo/fixtures/content";
import { PageHeader } from "./PageHeader";

const LEGAL_LINKS = [
  { href: "/terminos/", label: "Términos y condiciones" },
  { href: "/privacidad/", label: "Política de privacidad" },
  { href: "/arrepentimiento/", label: "Botón de arrepentimiento" },
  { href: "/preguntas/", label: "Ayuda del box" },
];

/** "1. Alcance" → "Alcance": el número lo pone la hoja. */
const bare = (title: string) => title.replace(/^\d+\.\s*/, "");
const num = (i: number) => String(i + 1).padStart(2, "0");
const slug = (i: number) => `seccion-${i + 1}`;

/**
 * Página legal con el sistema BOX: hoja de laboratorio legible (renglones de ~68 caracteres), índice numerado que
 * queda fijo al costado en escritorio, cada sección con su código y su carril, el aviso de texto de muestra y los
 * otros documentos al pie.
 */
export function LegalPage({ title, sections, intro }: { title: string; sections: LegalSection[]; intro?: string }) {
  return (
    <article>
      <PageHeader title={title}>{intro}</PageHeader>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="Índice" className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow text-muted">Índice</p>
          <ol className="mt-2 border-t border-line">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#${slug(i)}`} className="flex min-h-11 items-center gap-3 border-b border-line text-sm text-ink hover:bg-accent/50">
                  <span aria-hidden="true" className="w-6 font-mono text-[11px] font-bold text-volt-ink">{num(i)}</span>{bare(s.title)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0 max-w-[68ch]">
          <p role="note" className="mb-8 flex gap-3 border border-warning/60 bg-warning-soft p-3 text-sm text-ink">
            <span aria-hidden="true" className="hazard w-2 shrink-0 self-stretch" />
            <span><strong>Texto de muestra.</strong> Pendiente de los datos del vendedor y de revisión legal antes de publicar la tienda real.</span>
          </p>
          <div className="flex flex-col gap-10">
            {sections.map((s, i) => (
              <section key={s.title} id={slug(i)} aria-labelledby={`${slug(i)}-title`} className="scroll-mt-28">
                <div className="lane mb-4 pb-3">
                  <p aria-hidden="true" className="font-mono text-[11px] font-bold text-volt-ink">{num(i)}</p>
                  <h2 id={`${slug(i)}-title`} className="font-display text-2xl leading-none sm:text-3xl">{bare(s.title)}</h2>
                </div>
                {s.paragraphs.map((p) => <p key={p.slice(0, 24)} className="mb-3 text-[1.0625rem] leading-relaxed text-ink">{p}</p>)}
              </section>
            ))}
          </div>
          <nav aria-label="Otros documentos" className="mt-12 border-t-2 border-ink pt-4">
            <p className="eyebrow text-muted">Otros documentos</p>
            <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-x-6 sm:grid-cols-2">
              {LEGAL_LINKS.filter((l) => l.label !== title).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex min-h-11 items-center justify-between gap-2 border-b border-line text-sm font-semibold text-ink hover:text-volt-ink">
                    {l.label}<ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-volt-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </article>
  );
}
