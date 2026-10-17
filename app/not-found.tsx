import type { Metadata } from "next";
import { NotFoundView } from "@/features/help/NotFoundView";
import ShopLayout from "./(shop)/layout";

export const metadata: Metadata = { title: "Página no encontrada" };

/** 404 dentro de la tienda (R2c): con header, pie y dock, un buscador y los atajos ("Esta barra está vacía"). */
export default function NotFound() {
  return (
    <ShopLayout>
      <NotFoundView />
    </ShopLayout>
  );
}
