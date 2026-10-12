"use client";
import { Disc3, Gamepad2, Gift, TicketPercent } from "lucide-react";
import { sortedTiers } from "@/demo/engine/game-prize";
import { useAdmin } from "@/stores/admin";
import { HubCard, HubGrid } from "../marketing/HubCard";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";

export const COUPONS_SECTION = { href: "/admin-demo/cupones/", label: "Cupones y ruleta" };

/** Cupones y ruleta por tarjetas (8.3.24): cada tarea en su página, sin secciones largas una debajo de otra. */
export function CouponsHub() {
  const { coupons, wheel, game } = useAdmin((s) => s.data);
  const levels = sortedTiers(game.tiers);
  const prizes = wheel.prizes ?? [];
  const slots = wheel.segments.filter((s) => s.active).length;
  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Cupones y ruleta" intro="Elegí qué querés hacer. Los cupones, la ruleta y los premios del juego funcionan en el carrito de la tienda demo de este navegador." />
      <HubGrid label="Tareas de cupones y ruleta">
        <HubCard href="/admin-demo/cupones/lista/" icon={TicketPercent} title="Cupones" description="Crear, pausar y ver los usos de cada cupón." meta={`${coupons.length} cupones · ${coupons.filter((c) => c.active !== false).length} activos`} />
        <HubCard href="/admin-demo/cupones/ruleta/" icon={Disc3} title="Configuración de ruleta" description="Visibilidad, vigencia del premio, gajos y pesos." meta={`${wheel.active ? "Visible en la tienda" : "Pausada"} · ${slots} gajos activos`} />
        <HubCard href="/admin-demo/cupones/premios/" icon={Gift} title="Premios disponibles" description="El catálogo que se elige en cada gajo, con plantillas." meta={`${prizes.length} premios`} />
        <HubCard href="/admin-demo/cupones/juego/" icon={Gamepad2} title="Premios del juego" description="Shaker Rush: desde cuántos puntos se gana cada cupón y cuándo vence."
          meta={game.active ? `${levels.length} ${levels.length === 1 ? "nivel" : "niveles"} · ${levels.map((t) => t.label).join(" · ")}` : "Premios pausados"} />
      </HubGrid>
    </>
  );
}
