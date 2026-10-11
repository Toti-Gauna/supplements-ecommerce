import type { LegalSection } from "@/demo/fixtures/content";
import { PageHeader } from "./PageHeader";

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <article className="max-w-3xl">
      <PageHeader title={title} />
      <p className="mb-6 rounded-2xl border border-dashed border-warning bg-warning-soft p-3 text-sm text-warning">
        <strong>Texto de muestra.</strong> Pendiente de los datos del vendedor y de revisión legal antes de publicar la tienda real.
      </p>
      <div className="flex flex-col gap-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-extrabold">{s.title}</h2>
            {s.paragraphs.map((p) => <p key={p.slice(0, 24)} className="mb-2 leading-relaxed text-ink/90">{p}</p>)}
          </section>
        ))}
      </div>
    </article>
  );
}
