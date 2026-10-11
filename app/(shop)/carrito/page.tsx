import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { CartView } from "@/features/cart/CartView";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Tu carrito" />
      <CartView />
    </>
  );
}
