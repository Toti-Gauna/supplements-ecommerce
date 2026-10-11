import type { Metadata } from "next";
import Link from "next/link";
import { Camera, ImagePlus, Type } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { PageHeader } from "@/components/templates/PageHeader";
import { fromPrice, personalizableProducts, productHref } from "@/demo/engine/catalog";
import type { PersonalizationKind } from "@/demo/types";
import { formatARS } from "@/lib/money";

export const metadata: Metadata = { title: "Crear mi producto", description: "Personalizá con texto, foto o foto de referencia y aprobá la vista previa antes de pagar." };

const KINDS: { kind: PersonalizationKind; title: string; text: string; icon: typeof Type }[] = [
  { kind: "TEXT", title: "Con texto", text: "Escribí el nombre, elegí fuente y color. La vista previa cambia mientras escribís.", icon: Type },
  { kind: "PHOTO", title: "Con tu foto", text: "Subí una foto, movela y hacé zoom para encuadrarla en la pieza.", icon: Camera },
  { kind: "PHOTO_REFERENCE", title: "Desde una foto de referencia", text: "Para piezas pintadas a mano: subí la foto y contanos cómo la querés.", icon: ImagePlus },
];

export default function CreatePage() {
  const list = personalizableProducts();
  return (
    <>
      <PageHeader title="Crear mi producto personalizado">
        Elegí cómo personalizar. En todos los casos ves la vista previa y la aprobás antes de agregar al carrito. Tu foto no sale de este dispositivo en la demo.
      </PageHeader>
      <div className="flex flex-col gap-10">
        {KINDS.map(({ kind, title, text, icon: Icon }) => (
          <section key={kind} aria-labelledby={`k-${kind}`}>
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary"><Icon size={20} aria-hidden="true" /></span>
              <div>
                <h2 id={`k-${kind}`} className="text-xl font-extrabold">{title}</h2>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {list.filter((p) => p.personalization?.kind === kind).map((p) => (
                <li key={p.slug}>
                  <Link href={productHref(p.slug)} className="group flex flex-col gap-2 rounded-2xl bg-surface p-2 shadow-[var(--shadow-card)] hover:ring-2 hover:ring-primary">
                    <ProductArt art={p.art} tint={p.variants[0]?.colorHex} label={p.name} className="aspect-square rounded-xl" />
                    <span className="px-1 text-sm font-bold leading-tight">{p.name}</span>
                    <span className="px-1 pb-1 text-sm text-muted">desde {formatARS(fromPrice(p))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
