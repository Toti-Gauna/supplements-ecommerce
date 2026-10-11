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
      className={`fixed right-4 z-30 inline-flex items-center gap-2 rounded-full bg-[#1f6f43] px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#185a36] ${bar === "none" ? "bottom-5" : bar === "product" ? "bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:bottom-6" : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6"}`}
    >
      <MessageCircle size={20} aria-hidden="true" />
      <span className="max-sm:sr-only">Consultar por WhatsApp</span>
    </a>
  );
}
