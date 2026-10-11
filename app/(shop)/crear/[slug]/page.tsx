import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/templates/PageHeader";
import { getProduct, personalizableProducts } from "@/demo/engine/catalog";
import { ProductDetail } from "@/features/product/ProductDetail";
import { ProductRecommendations } from "@/features/product/ProductRecommendations";

export const dynamicParams = false;

export function generateStaticParams() {
  return personalizableProducts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: `Personalizar ${product.name}`, alternates: { canonical: `/p/${product.slug}/` } } : {};
}

/** Enlace histórico de "crear": muestra la misma ficha todo en uno (la personalización está en la ficha). */
export default async function PersonalizePage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product?.personalization) notFound();
  return (
    <div className="pb-36 sm:pb-0">
      <div className="mb-4"><Breadcrumbs crumbs={[{ href: "/crear/", label: "Crear" }]} /></div>
      <ProductDetail product={product} />
      <div className="mt-24"><ProductRecommendations slug={slug} /></div>
    </div>
  );
}
