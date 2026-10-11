import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { CouponsView } from "@/features/cart/CouponsView";

export const metadata: Metadata = { title: "Mis cupones", description: "Tus cupones de la ruleta y los vigentes de la tienda, listos para aplicar." };

export default function CouponsPage() {
  return (
    <>
      <PageHeader title="Mis cupones">Elegí uno y se aplica a tu carrito. Cupones de muestra: en la demo no se cobra nada.</PageHeader>
      <CouponsView />
    </>
  );
}
