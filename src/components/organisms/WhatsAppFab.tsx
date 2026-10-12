"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { bottomBarFor } from "./bottomBars";
import { getProduct } from "@/demo/engine/catalog";
import { whatsappLink, whatsappMessage } from "@/lib/whatsapp";
import { useDemoData } from "@/stores/admin";

/** CTA para continuar por WhatsApp con texto según la página. No reemplaza el flujo de compra. */
export function WhatsAppFab() {
  const pathname = usePathname();
  useDemoData((d) => d.settings.whatsappNumber); // re-render si cambia el número en el panel
  const slug = pathname.match(/\/(?:p|crear)\/([^/]+)/)?.[1];
  const productName = slug ? getProduct(slug)?.name : undefined;
  const page = pathname.startsWith("/checkout") ? "checkout" : pathname.startsWith("/crear") ? "crear" : undefined;
  // Sube por encima de la barra fija inferior que tenga la pantalla en el celular.
  const bar = bottomBarFor(pathname);
  if (bar === "preview") return null;
  return (
    <a
      href={whatsappLink(whatsappMessage({ productName, page }))}
      target="_blank"
      rel="noopener noreferrer"
      className={`group fixed right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#1f6f43] text-sm font-bold text-white shadow-lg hover:bg-[#185a36] ${bar === "none" ? "bottom-5" : bar === "product" ? "bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:bottom-6" : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6"}`}
    >
      <MessageCircle size={22} aria-hidden="true" />
      {/* Solo el ícono, así no tapa los botones de compra que quedan abajo a la derecha (resumen del armador, tarjetas
          de la ficha); el texto aparece como globo al pasar el mouse o con el foco, y siempre es el nombre del link. */}
      <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-full bg-[#1f6f43] px-3 py-1.5 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:sr-only motion-reduce:transition-none">Consultar por WhatsApp</span>
    </a>
  );
}
