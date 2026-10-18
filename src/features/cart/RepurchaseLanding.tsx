"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { CART_LINK_PARAM, decodeCartLink } from "@/demo/engine/cart-link";
import { plural } from "@/lib/plural";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { useToasts } from "@/stores/toast";

/**
 * /recompra/ (R4c): el link que el local le manda a un cliente por WhatsApp. Al abrirlo carga en el bolso los mismos
 * productos de su última compra (los que existen y tienen stock hoy) y lo lleva al carrito para que confirme. No hay
 * pedido hasta que paga; nada sale del navegador.
 */
export function RepurchaseLanding() {
  const router = useRouter();
  const raw = useSearchParams().get(CART_LINK_PARAM);
  const hydrated = useHydrated();
  const catalog = useDemoData((d) => d.products);
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const done = useRef(false);
  const { lines, dropped } = useMemo(() => decodeCartLink(raw, catalog), [raw, catalog]);
  useEffect(() => {
    if (!hydrated || done.current || !lines.length) return;
    done.current = true;
    for (const l of lines) add({ productSlug: l.slug, variantId: l.variantId, quantity: l.qty });
    push({ tone: "success", title: "Tu bolso está armado", description: `${plural(lines.length, "producto", "productos")} de tu compra anterior.${dropped ? ` ${plural(dropped, "ya no está disponible", "ya no están disponibles")}.` : ""} Confirmá cuando quieras.` });
    router.replace("/carrito/");
  }, [hydrated, lines, dropped, add, push, router]);
  if (!hydrated || lines.length) return <div data-repurchase-landing><HeroSkeleton label="Armando tu bolso" /></div>;
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState title="Este link no tiene productos disponibles" action={<ButtonLink href="/">Ir a la tienda</ButtonLink>}>
        Puede que ya no haya stock de lo que compraste o que el link esté incompleto. Escribinos por WhatsApp y te lo armamos.
      </EmptyState>
    </div>
  );
}
