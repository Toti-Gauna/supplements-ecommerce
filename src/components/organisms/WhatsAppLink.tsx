"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getProduct } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";
import { whatsappLink, whatsappMessage } from "@/lib/whatsapp";
import { useDemoData } from "@/stores/admin";

/**
 * "Consultar por WhatsApp" con el texto según la página (producto, armador, checkout). Ya no flota sobre la tienda:
 * va en el menú del celular y en el pie. No reemplaza el flujo de compra.
 */
export function WhatsAppLink({ className }: { className?: string }) {
  const pathname = usePathname();
  useDemoData((d) => d.settings.whatsappNumber); // re-render si cambia el número en el panel
  const slug = pathname.match(/\/(?:p|crear)\/([^/]+)/)?.[1];
  const productName = slug ? getProduct(slug)?.name : undefined;
  const page = pathname.startsWith("/checkout") ? "checkout" : pathname.startsWith("/crear") ? "crear" : undefined;
  return (
    <a href={whatsappLink(whatsappMessage({ productName, page }))} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-2", className)}>
      <MessageCircle size={18} aria-hidden="true" className="shrink-0" />
      Consultar por WhatsApp
    </a>
  );
}
