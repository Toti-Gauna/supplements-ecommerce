"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NavTabs, type NavTab } from "@/components/molecules/NavTabs";
import { BADGE_TEXT } from "./nav";
import { resolvePlace, type MenuTab } from "./menu";
import { useNavCounts } from "./useNavCounts";

/**
 * Pestañas de la sección actual (R4a), arriba de cada pantalla del panel. Reemplazan a las pantallas puente: cada
 * pestaña es una ruta con su propia pantalla. Una sección con una sola pestaña (Clientes) no las muestra. El contenido
 * va en el panel de la pestaña activa.
 */
export function SectionTabs({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const counts = useNavCounts();
  const place = resolvePlace(pathname);
  const toTab = (t: MenuTab): NavTab => ({ id: t.id, label: t.label, href: t.href, count: t.badge ? counts[t.badge] : undefined, countLabel: t.badge ? BADGE_TEXT[t.badge] : undefined });
  const tabs = place?.section.tabs ?? [];
  const kids = place?.tab?.children;
  if (!place || tabs.length < 2) return <>{children}</>;
  return (
    <>
      <NavTabs idBase="seccion" label="Pestañas de la sección" tabs={tabs.map(toTab)} value={place.tab?.id} className="mb-5" />
      {kids && <NavTabs idBase="subseccion" label="Subpestañas" tabs={kids.map(toTab)} value={place.sub?.id} size="sm" className="-mt-2 mb-5" />}
      <div role="tabpanel" id="seccion-panel">{children}</div>
    </>
  );
}
