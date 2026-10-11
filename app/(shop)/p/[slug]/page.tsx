import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSwap } from "@/components/motion/PageSwap";
import { Breadcrumbs } from "@/components/templates/PageHeader";
import { getCategory, getProduct } from "@/demo/engine/catalog";
import { products } from "@/demo/fixtures/products";
import { ProductDetail } from "@/features/product/ProductDetail";
import { ProductRecommendations } from "@/features/product/ProductRecommendations";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.short, openGraph: { title: product.name, description: product.description } } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.categorySlug);
  return (
    <PageSwap id={slug}>
    <div className="pb-36 sm:pb-0">
      <div className="mb-4"><Breadcrumbs crumbs={category ? [{ href: `/c/${category.slug}/`, label: category.name }] : []} /></div>
      <ProductDetail product={product} />
      <div className="mt-24"><div className="cv-auto cv-bleed" style={{ containIntrinsicSize: "auto 560px" }}><ProductRecommendations slug={slug} /></div></div>
    </div>
    </PageSwap>
  );
}
