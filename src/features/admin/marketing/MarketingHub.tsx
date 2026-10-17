"use client";
import { upcomingCampaign } from "@/demo/admin/campaign-calendar";
import { packsHubMeta } from "@/demo/admin/pack-rows";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { stackRuleLabel } from "@/demo/admin/stack-rule";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { ADMIN_NAV } from "../nav";
import { useAdmin } from "@/stores/admin";
import { useSubscriptions } from "@/stores/subscriptions";
import { AdminPageHeader } from "../AdminPageHeader";
import { NextCampaignCard } from "../campaigns/NextCampaignCard";
import { HubCard, HubGrid } from "./HubCard";

const DESCRIPTION: Record<string, string> = {
  "/admin-demo/misiones/": "Retos de compra con un premio de un uso para el Club, y la liga de gimnasios.",
  "/admin-demo/emails/": "Qué email sale en cada momento del pedido, el aviso de recompra y la bandeja de salida.",
  "/admin-demo/cupones/": "Cupones del carrito, la ruleta y los premios de Shaker Rush.",
  "/admin-demo/descuento-stack/": "Cuánto se descuenta al sumar suplementos de varias categorías.",
  "/admin-demo/packs/": "Packs por objetivo o deporte, con descuento, y las suscripciones “todos los meses” con lo que hay que preparar.",
  "/admin-demo/campanas/": "Calendario del año con las fechas comerciales y los días del deporte: titular, cupón, productos, resultados y piezas.",
  "/admin-demo/estudio/": "Piezas para Instagram con los potes animados: oferta, producto, stack o juego.",
  "/admin-demo/contenido/": "Carrusel de la portada, textos y preguntas frecuentes.",
};

/** Marketing por tarjetas (8.3.24): una por herramienta, con el estado de un vistazo. Las entradas del menú siguen. */
export function MarketingHub() {
  const { missions, coupons, wheel, settings, themes } = useAdmin((s) => s.data);
  const next = upcomingCampaign(themes, DEMO_TODAY);
  const { templates } = useAdmin((s) => s.emails);
  const packs = useAdmin((s) => s.data.packs);
  const subscriptions = useSubscriptions((s) => s.subscriptions);
  const meta: Record<string, string> = {
    "/admin-demo/misiones/": `${missions.filter((m) => m.active !== false).length} de ${missions.length} activas`,
    "/admin-demo/emails/": `${templates.filter((t) => t.active).length} de ${templates.length} se envían solos`,
    "/admin-demo/cupones/": `${coupons.filter((c) => c.active !== false).length} cupones activos · ruleta ${wheel.active ? "visible" : "pausada"}`,
    "/admin-demo/descuento-stack/": stackRuleLabel(settings.stack ?? DEFAULT_STACK_RULE),
    "/admin-demo/packs/": packsHubMeta(packs, subscriptions),
    "/admin-demo/campanas/": next ? `Próxima: ${next.theme.name} en ${next.daysLeft} ${next.daysLeft === 1 ? "día" : "días"}` : `${themes.length} campañas`,
  };
  return (
    <>
      <AdminPageHeader title="Marketing">Elegí una herramienta. Cada una abre su propia página y desde ahí volvés acá.</AdminPageHeader>
      <NextCampaignCard className="mb-6" />
      <HubGrid label="Herramientas de marketing">
        {ADMIN_NAV.filter((n) => n.group === "Marketing" && n.href !== "/admin-demo/marketing/").map((n) => (
          <HubCard key={n.href} href={n.href} icon={n.icon} title={n.label === "Misiones" ? "Misiones y premios" : n.label} description={DESCRIPTION[n.href] ?? ""} meta={meta[n.href]} />
        ))}
      </HubGrid>
    </>
  );
}
