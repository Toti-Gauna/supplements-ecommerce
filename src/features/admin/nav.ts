import type { LucideIcon } from "lucide-react";
import { BadgePercent, Boxes, Calculator, CalendarDays, Clapperboard, ClipboardList, Factory, LayoutDashboard, Mail, LifeBuoy, Megaphone, Palette, PartyPopper, Settings, Shapes, Spool, Target, Users, Wallet } from "lucide-react";

export const ADMIN_GROUPS = ["Ventas", "Taller", "Catálogo", "Marketing", "Ajustes"] as const;

export type NavBadge = "orders" | "payments" | "claims" | "stock" | "late" | "materials";

/** Texto para lectores de pantalla después del número del contador. */
export const BADGE_TEXT: Record<NavBadge, string> = { orders: "en marcha", payments: "por revisar", claims: "abiertos", stock: "para reponer", late: "atrasados", materials: "para reponer" };

export interface AdminNavItem {
  href: string;
  label: string;
  /** Rótulo corto para las pestañas inferiores del celular. */
  short: string;
  icon: LucideIcon;
  group: (typeof ADMIN_GROUPS)[number];
  badge?: NavBadge;
  /** Aparece en las pestañas inferiores del celular. */
  tab?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin-demo/", label: "Inicio", short: "Inicio", icon: LayoutDashboard, group: "Ventas", tab: true },
  { href: "/admin-demo/pedidos/", label: "Pedidos", short: "Pedidos", icon: ClipboardList, group: "Ventas", badge: "orders", tab: true },
  { href: "/admin-demo/pagos/", label: "Pagos manuales", short: "Pagos", icon: Wallet, group: "Ventas", badge: "payments", tab: true },
  { href: "/admin-demo/usuarios/", label: "Clientes", short: "Clientes", icon: Users, group: "Ventas" },
  { href: "/admin-demo/reclamos/", label: "Reclamos", short: "Reclamos", icon: LifeBuoy, group: "Ventas", badge: "claims" },
  { href: "/admin-demo/calendario/", label: "Calendario de entregas", short: "Calendario", icon: CalendarDays, group: "Taller", badge: "late" },
  { href: "/admin-demo/produccion/", label: "Cola de producción", short: "Producción", icon: Factory, group: "Taller" },
  { href: "/admin-demo/costos/", label: "Costos y margen", short: "Costos", icon: Calculator, group: "Taller" },
  { href: "/admin-demo/insumos/", label: "Insumos", short: "Insumos", icon: Spool, group: "Taller", badge: "materials" },
  // 8.3.19: un solo módulo. Stock es su vista por variante, la Planilla es "Ver en formato Excel" e importar es una
  // acción de la pantalla; las rutas anteriores siguen llevando acá.
  { href: "/admin-demo/productos/", label: "Productos y stock", short: "Productos", icon: Boxes, group: "Catálogo", badge: "stock", tab: true },
  { href: "/admin-demo/categorias/", label: "Categorías y personalización", short: "Categorías", icon: Shapes, group: "Catálogo" },
  // 8.3.24: entrada con una tarjeta por herramienta de Marketing; cada una sigue con su acceso propio.
  { href: "/admin-demo/marketing/", label: "Resumen", short: "Marketing", icon: Megaphone, group: "Marketing" },
  { href: "/admin-demo/misiones/", label: "Misiones", short: "Misiones", icon: Target, group: "Marketing" },
  { href: "/admin-demo/emails/", label: "Emails automáticos", short: "Emails", icon: Mail, group: "Marketing" },
  { href: "/admin-demo/cupones/", label: "Cupones y ruleta", short: "Cupones", icon: BadgePercent, group: "Marketing" },
  { href: "/admin-demo/tematicas/", label: "Temáticas", short: "Temáticas", icon: PartyPopper, group: "Marketing" },
  { href: "/admin-demo/estudio/", label: "Estudio de contenido", short: "Estudio", icon: Clapperboard, group: "Marketing" },
  { href: "/admin-demo/contenido/", label: "Contenido", short: "Contenido", icon: Palette, group: "Marketing" },
  { href: "/admin-demo/ajustes/", label: "Ajustes", short: "Ajustes", icon: Settings, group: "Ajustes" },
];


/** Rutas sin entrada propia en el menú: se marcan como parte de otra sección. */
const BELONGS_TO: [string, string][] = [["/admin-demo/importar", "/admin-demo/productos/"], ["/admin-demo/stock", "/admin-demo/productos/"], ["/admin-demo/planilla", "/admin-demo/productos/"]];

export function isActive(pathname: string, href: string): boolean {
  const path = BELONGS_TO.find(([from]) => pathname.startsWith(from))?.[1] ?? pathname;
  return href === "/admin-demo/" ? path === "/admin-demo/" || path === "/admin-demo" : path.startsWith(href);
}

export function currentSection(pathname: string): AdminNavItem {
  return ADMIN_NAV.find((n) => n.href !== "/admin-demo/" && isActive(pathname, n.href)) ?? ADMIN_NAV[0]!;
}
