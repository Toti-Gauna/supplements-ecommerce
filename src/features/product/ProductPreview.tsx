"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { DetailSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { cameFromEditor, editedSlug, editorHref, forgetPreview, loadSnapshot, markPreview } from "@/features/admin/products/editorDrafts";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { ProductDetail } from "./ProductDetail";

/**
 * Vista previa de un producto del panel en la tienda (8.3.21): la misma ficha, con el borrador sin guardar. No
 * publica, no guarda y no se puede comprar; la franja con "Volver al editor" queda siempre a la vista, abajo.
 */
export function ProductPreview() {
  const hydrated = useHydrated();
  const router = useRouter();
  const key = useSearchParams().get("borrador") ?? "";
  const slug = editedSlug(key);
  const stored = useDemoData((d) => (slug ? d.products.find((p) => p.slug === slug) : undefined));
  const snap = useMemo(() => (hydrated ? loadSnapshot(key) : null), [hydrated, key]);
  // Si desde acá se va a otra página de la tienda, "Volver" ya no puede usar Atrás: navega al editor.
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.("a[href]")) forgetPreview(); };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  if (!hydrated) return <DetailSkeleton />;
  const product = snap?.product ?? stored;
  const label = slug ? "Volver al editor" : "Volver a la creación";
  const back = () => {
    if (cameFromEditor(key)) { router.back(); return; }
    markPreview(key);
    const step = snap?.step && snap.step !== "foto" ? `#paso-${snap.step}` : "";
    router.push(editorHref(key) + step);
  };
  if (!product) {
    return (
      <EmptyState title="No hay nada para previsualizar" action={<ButtonLink href={editorHref(key)}>{label}</ButtonLink>}>
        El borrador ya se guardó o se descartó, o se abrió en otra pestaña.
      </EmptyState>
    );
  }
  return (
    <>
      <p role="note" className="mb-6 rounded-2xl bg-warning-soft px-4 py-3 text-sm font-semibold text-warning ring-1 ring-warning/30">
        Vista previa del panel: así se ve en la tienda con los cambios sin guardar. No está publicada y no se puede comprar.
        {product.active === false && " Está pausado: al guardarlo no va a aparecer en la tienda."}
      </p>
      <ProductDetail preview product={{ ...product, name: product.name.trim() || "Producto sin nombre" }} />
      <aside aria-label="Vista previa sin publicar"
        className="fixed inset-x-3 bottom-[calc(0.625rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-[1.75rem] bg-night/95 p-2 pl-4 text-[#f6f1e8] shadow-[0_18px_40px_-14px_rgb(0_0_0/0.55)] ring-1 ring-white/10 backdrop-blur-xl sm:bottom-6">
        <Eye size={20} aria-hidden="true" className="shrink-0 text-brass" />
        <p className="min-w-0 flex-1 text-sm font-bold leading-tight">Vista previa<span className="block text-xs font-semibold text-[#f6f1e8]/80 sm:inline"><span className="max-sm:hidden"> · </span>sin publicar</span></p>
        <Button variant="secondary" onClick={back} className="min-h-11 shrink-0 px-4"><ArrowLeft size={16} aria-hidden="true" />{label}</Button>
      </aside>
    </>
  );
}
