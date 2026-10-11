import { PageSwap } from "@/components/motion/PageSwap";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/templates/PageHeader";
import { getCategory, productsInCategory, visibleCategories } from "@/demo/engine/catalog";
import { CategoryProducts } from "@/features/catalog/CategoryProducts";

export const dynamicParams = false;

export function generateStaticParams() {
  return visibleCategories().map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return category ? { title: category.name, description: category.description } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const list = productsInCategory(slug);
  return (
    <PageSwap id={slug}>
      <PageHeader title={category.name} crumbs={[{ href: "/categorias/", label: "Categorías" }]}>{category.description}</PageHeader>
      <CategoryProducts categorySlug={slug} hadProducts={list.length > 0} />
    </PageSwap>
  );
}
