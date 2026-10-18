import type { LucideIcon } from "lucide-react";
import { BadgePercent, Boxes, ClipboardList, LayoutDashboard, PartyPopper, ScanBarcode, Settings, Users, Warehouse } from "lucide-react";
import { MOBILE_ORDER, SECTIONS, resolvePlace, type BadgeKey, type MenuSection, type SectionId } from "./menu";

export type NavBadge = BadgeKey;

/** Texto para lectores de pantalla después del número del contador. */
export const BADGE_TEXT: Record<NavBadge, string> = { orders: "en marcha", payments: "por revisar", claims: "abiertos", stock: "para reponer", late: "atrasados", materials: "para reponer", prep: "por preparar" };

/** Contadores que cuentan como "algo para atender" en el menú principal (los pedidos en marcha no: son informativos). */
export const ATTENTION: Partial<Record<SectionId, NavBadge[]>> = {
  pedidos: ["payments", "prep", "late", "claims"], stock: ["stock"], compras: ["materials"],
};

const ICONS: Record<SectionId, LucideIcon> = {
  hoy: LayoutDashboard, mostrador: ScanBarcode, pedidos: ClipboardList, stock: Boxes, compras: Warehouse, clientes: Users, promos: BadgePercent, campanas: PartyPopper, ajustes: Settings,
};

export interface AdminNavItem extends MenuSection { icon: LucideIcon; attention: NavBadge[] }

/** Las 9 entradas del menú, en orden. */
export const ADMIN_NAV: AdminNavItem[] = SECTIONS.map((s) => ({ ...s, icon: ICONS[s.id], attention: ATTENTION[s.id] ?? [] }));

/** Entradas con pestaña propia en el celular; el resto está en "Más". */
export const MOBILE_NAV: AdminNavItem[] = MOBILE_ORDER.map((id) => ADMIN_NAV.find((n) => n.id === id)!);

/** Sección a la que pertenece la ruta (Hoy si no es ninguna). */
export function currentSection(pathname: string): AdminNavItem {
  const id = resolvePlace(pathname)?.section.id ?? "hoy";
  return ADMIN_NAV.find((n) => n.id === id)!;
}

export function isActive(pathname: string, item: AdminNavItem): boolean {
  return resolvePlace(pathname)?.section.id === item.id;
}
