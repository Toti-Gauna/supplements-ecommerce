"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { useUi } from "@/stores/ui";

// Cupones y buscador se descargan la primera vez que se abren (no pesan en la carga de cada página). El carrito
// queda incluido: es lo que más se abre y tiene que responder al instante (también a Escape enseguida de agregar).
// Si el archivo no llega (red cortada), el panel no abre pero la tienda sigue andando.
const none = () => function Unavailable() { return null; };
const CouponsSheet = dynamic(() => import("@/features/cart/CouponsSheet").then((m) => m.CouponsSheet, none), { ssr: false });
const SearchModal = dynamic(() => import("@/features/catalog/SearchModal").then((m) => m.SearchModal, none), { ssr: false });

/** Una vez abierto queda montado: así el cierre tiene su animación y la segunda vez abre al instante. */
function useOpenedOnce(open: boolean): boolean {
  const [ever, setEver] = useState(open);
  if (open && !ever) setEver(true);
  return ever;
}

export function LazyOverlays() {
  const { couponsOpen, searchOpen } = useUi();
  const coupons = useOpenedOnce(couponsOpen);
  const search = useOpenedOnce(searchOpen);
  // Con la página quieta se precargan en segundo plano, para que el primer toque no espere la descarga.
  useEffect(() => {
    const warm = () => { for (const load of [() => import("@/features/catalog/SearchModal"), () => import("@/features/cart/CouponsSheet"), () => import("@/features/club/WheelStagePanel")]) load().catch(() => {}); };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
    const id = window.setTimeout(() => idle(warm), 4000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <>
      <CartDrawer />
      {coupons && <CouponsSheet />}
      {search && <SearchModal />}
    </>
  );
}
