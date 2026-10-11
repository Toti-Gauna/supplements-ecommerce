"use client";
import { ADMIN_NAV } from "../nav";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { HubCard, HubGrid } from "./HubCard";

const DESCRIPTION: Record<string, string> = {
  "/admin-demo/misiones/": "Retos de compra con un premio de un uso para el Club.",
  "/admin-demo/emails/": "Qué email sale en cada momento del pedido y la bandeja de salida.",
  "/admin-demo/cupones/": "Cupones del carrito, la ruleta y su catálogo de premios.",
  "/admin-demo/tematicas/": "Fechas especiales con paleta, cinta, cupón y ofertas.",
  "/admin-demo/estudio/": "Piezas para Instagram por fecha, en imagen y en video.",
  "/admin-demo/contenido/": "Carrusel de la portada, textos y preguntas frecuentes.",
};

/** Marketing por tarjetas (8.3.24): una por herramienta, con el estado de un vistazo. Las entradas del menú siguen. */
export function MarketingHub() {
  const { missions, coupons, wheel } = useAdmin((s) => s.data);
  const { templates } = useAdmin((s) => s.emails);
  const meta: Record<string, string> = {
    "/admin-demo/misiones/": `${missions.filter((m) => m.active !== false).length} de ${missions.length} activas`,
    "/admin-demo/emails/": `${templates.filter((t) => t.active).length} de ${templates.length} se envían solos`,
    "/admin-demo/cupones/": `${coupons.filter((c) => c.active !== false).length} cupones activos · ruleta ${wheel.active ? "visible" : "pausada"}`,
  };
  return (
    <>
      <AdminPageHeader title="Marketing">Elegí una herramienta. Cada una abre su propia página y desde ahí volvés acá.</AdminPageHeader>
      <HubGrid label="Herramientas de marketing">
        {ADMIN_NAV.filter((n) => n.group === "Marketing" && n.href !== "/admin-demo/marketing/").map((n) => (
          <HubCard key={n.href} href={n.href} icon={n.icon} title={n.label === "Misiones" ? "Misiones y premios" : n.label} description={DESCRIPTION[n.href] ?? ""} meta={meta[n.href]} />
        ))}
      </HubGrid>
    </>
  );
}
