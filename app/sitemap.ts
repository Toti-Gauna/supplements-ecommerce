import type { MetadataRoute } from "next";
import { personalizableProducts, visibleCategories } from "@/demo/engine/catalog";
import { products } from "@/demo/fixtures/products";
import { SITE_URL } from "@/lib/base-path";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/", "/buscar/", "/categorias/", "/crear/", "/favoritos/", "/preguntas/", "/terminos/", "/privacidad/", "/arrepentimiento/",
    ...visibleCategories().map((c) => `/c/${c.slug}/`),
    ...products.map((p) => `/p/${p.slug}/`),
    ...personalizableProducts().map((p) => `/crear/${p.slug}/`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
