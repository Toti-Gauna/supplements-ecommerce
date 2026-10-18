/**
 * Menú del panel: 9 secciones con pestañas (módulo puro): a qué sección y pestaña pertenece cada ruta y adónde
 * redirigen las rutas viejas. "Mostrador" va 2.º y en el centro de `MOBILE_ORDER`. Pedidos se ordena por lo que hay
 * que hacer; Por cobrar y Para armar reusan las rutas de Pagos manuales y Preparación.
 */
const P = "/admin-demo";

export type SectionId = "hoy" | "mostrador" | "pedidos" | "stock" | "compras" | "clientes" | "promos" | "campanas" | "ajustes";
export type BadgeKey = "orders" | "payments" | "claims" | "stock" | "late" | "materials" | "prep";

export interface MenuTab {
  id: string;
  label: string;
  /** Adónde lleva la pestaña. */
  href: string;
  /** Rutas (sin barra final) que pertenecen a la pestaña: la más larga que coincida gana. */
  match: string[];
  badge?: BadgeKey;
  /** Segundo nivel de pestañas (Ajustes → Contenido, Emails). */
  children?: MenuTab[];
}

export interface MenuSection {
  id: SectionId;
  label: string;
  /** Rótulo corto para las pestañas inferiores del celular. */
  short: string;
  href: string;
  tabs: MenuTab[];
}

const tab = (id: string, label: string, path: string, match: string[] = [], badge?: BadgeKey, children?: MenuTab[]): MenuTab =>
  ({ id, label, href: `${P}${path}`, match: [`${P}${path.replace(/\/$/, "")}`, ...match.map((m) => `${P}${m}`)], badge, children });

export const SECTIONS: MenuSection[] = [
  { id: "hoy", label: "Hoy", short: "Hoy", href: `${P}/`, tabs: [] },
  { id: "mostrador", label: "Mostrador", short: "Mostrador", href: `${P}/mostrador/`, tabs: [
    tab("vender", "Vender", "/mostrador/"),
    tab("chat", "Pedido por chat", "/mostrador/chat/"),
    tab("cierre", "Cierre del día", "/mostrador/cierre/"),
    tab("consulta", "Consulta rápida", "/mostrador/consulta/"),
  ] },
  { id: "pedidos", label: "Pedidos", short: "Pedidos", href: `${P}/pagos/`, tabs: [
    tab("cobrar", "Por cobrar", "/pagos/", [], "payments"),
    tab("armar", "Para armar", "/preparacion/", ["/produccion"], "prep"),
    tab("despachos", "Despachos", "/despachos/", ["/calendario"], undefined, [
      tab("ruta", "Lista y hoja de ruta", "/despachos/"),
      tab("calendario", "Calendario", "/calendario/"),
    ]),
    tab("postventa", "Postventa", "/postventa/", ["/reclamos"], "claims", [
      tab("seguimiento", "Seguimiento", "/postventa/"),
      tab("reclamos", "Reclamos", "/reclamos/"),
    ]),
    tab("pedidos", "Todos", "/pedidos/", [], "orders"),
  ] },
  { id: "stock", label: "Stock", short: "Stock", href: `${P}/productos/`, tabs: [
    tab("productos", "Productos y stock", "/productos/", ["/stock", "/planilla"], "stock"),
    tab("categorias", "Categorías", "/categorias/"),
    tab("packs", "Packs", "/packs/"),
    tab("importar", "Importar", "/importar/"),
  ] },
  { id: "compras", label: "Compras", short: "Compras", href: `${P}/proveedores/`, tabs: [
    tab("proveedores", "Proveedores", "/proveedores/"),
    tab("insumos", "Insumos", "/insumos/", [], "materials"),
    tab("costos", "Costos y margen", "/costos/", [], undefined, [
      tab("por-producto", "Por producto", "/costos/"),
      tab("vivos", "Costos vivos", "/costos/vivos/"),
    ]),
    tab("lista-proveedor", "Lista del proveedor", "/lista-proveedor/"),
  ] },
  { id: "clientes", label: "Clientes", short: "Clientes", href: `${P}/usuarios/`, tabs: [tab("clientes", "Clientes", "/usuarios/")] },
  { id: "promos", label: "Promos", short: "Promos", href: `${P}/promos/`, tabs: [
    tab("cupones", "Cupones", "/promos/", ["/cupones"]),
    tab("stack", "Descuento stack", "/descuento-stack/"),
    tab("ruleta", "Ruleta", "/cupones/ruleta/", ["/cupones/premios"], undefined, [
      tab("config", "Configuración", "/cupones/ruleta/"),
      tab("premios", "Premios disponibles", "/cupones/premios/"),
    ]),
    tab("juego", "Premios del juego", "/cupones/juego/"),
    tab("misiones", "Misiones", "/misiones/", [], undefined, [
      tab("lista", "Misiones y premios", "/misiones/"),
      tab("simular", "Simular progreso", "/misiones/simular/"),
    ]),
    tab("regalos", "Regalos y gift cards", "/regalos/"),
  ] },
  { id: "campanas", label: "Campañas", short: "Campañas", href: `${P}/campanas/`, tabs: [
    tab("campanas", "Campañas", "/campanas/", ["/marketing", "/tematicas"]),
    tab("estudio", "Estudio de contenido", "/estudio/"),
  ] },
  { id: "ajustes", label: "Ajustes", short: "Ajustes", href: `${P}/ajustes/`, tabs: [
    tab("contacto", "Contacto", "/ajustes/"),
    tab("medios", "Medios de pago", "/ajustes/pagos/"),
    tab("cobro", "Datos de cobro", "/ajustes/cobro/"),
    tab("envios", "Envíos y retiro", "/ajustes/envios/"),
    tab("contenido", "Contenido", "/contenido/carrusel/", ["/contenido"], undefined, [
      tab("carrusel", "Carrusel", "/contenido/carrusel/"),
      tab("textos", "Textos de inicio", "/contenido/textos/"),
      tab("preguntas", "Preguntas frecuentes", "/contenido/preguntas/"),
    ]),
    tab("emails", "Emails", "/emails/", [], undefined, [
      tab("plantillas", "Emails automáticos", "/emails/"),
      tab("bandeja", "Bandeja de salida", "/emails/enviados/"),
    ]),
  ] },
];

/** Pestañas del celular, de izquierda a derecha, y "Más" al final. "Mostrador" (R4b) va en el centro. */
export const MOBILE_ORDER: SectionId[] = ["hoy", "pedidos", "mostrador", "stock", "promos"];

/** Rutas viejas que ya no tienen pantalla propia: llevan a su lugar nuevo. `carry` copia parámetros viejos con su nombre nuevo. */
export interface Moved { to: string; label: string; carry?: Record<string, string> }
export const MOVED: Record<string, Moved> = {
  [`${P}/marketing`]: { to: `${P}/campanas/`, label: "Campañas" },
  [`${P}/tematicas`]: { to: `${P}/campanas/`, label: "Campañas" },
  [`${P}/cupones`]: { to: `${P}/promos/`, label: "Promos · Cupones" },
  [`${P}/cupones/lista`]: { to: `${P}/promos/`, label: "Promos · Cupones" },
  [`${P}/contenido`]: { to: `${P}/contenido/carrusel/`, label: "Ajustes · Contenido" },
  [`${P}/ajustes/contacto`]: { to: `${P}/ajustes/`, label: "Ajustes · Contacto" },
  [`${P}/produccion`]: { to: `${P}/preparacion/`, label: "Pedidos · Para armar" },
  [`${P}/stock`]: { to: `${P}/productos/?ver=variantes`, label: "Stock · Productos", carry: { vista: "stock", q: "q" } },
  [`${P}/planilla`]: { to: `${P}/productos/?formato=excel`, label: "Stock · formato Excel", carry: { q: "q" } },
};

/** Ruta sin barra final ni basePath (excepto la raíz del panel). */
export function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0]!.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

const owns = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
const specificity = (t: MenuTab, path: string) => Math.max(-1, ...t.match.filter((m) => owns(path, m)).map((m) => m.length));

export interface Place { section: MenuSection; tab?: MenuTab; sub?: MenuTab }

/** Sección, pestaña y subpestaña a las que pertenece una ruta (o null si no es del panel). */
export function resolvePlace(pathname: string): Place | null {
  const path = normalizePath(pathname);
  if (path === P) return { section: SECTIONS[0]! };
  let best: { place: Place; score: number } | null = null;
  for (const section of SECTIONS) {
    for (const t of section.tabs) {
      const kids = t.children ?? [];
      const sub = kids.map((k) => ({ k, s: specificity(k, path) })).sort((a, b) => b.s - a.s)[0];
      const score = Math.max(specificity(t, path), sub?.s ?? -1);
      if (score >= 0 && (!best || score > best.score)) best = { score, place: { section, tab: t, sub: sub && sub.s >= 0 ? sub.k : undefined } };
    }
  }
  return best?.place ?? null;
}

/** Nuevo lugar de una ruta vieja, con los parámetros que haya que conservar (`search` es el `?…` de la URL vieja). */
export function movedTarget(pathname: string, search = ""): string | null {
  const moved = MOVED[normalizePath(pathname)];
  if (!moved) return null;
  const [path, base = ""] = moved.to.split("?");
  const next = new URLSearchParams(base);
  const old = new URLSearchParams(search);
  for (const [from, name] of Object.entries(moved.carry ?? {})) { const v = old.get(from); if (v) next.set(name, v); }
  return next.size ? `${path}?${next}` : path!;
}
