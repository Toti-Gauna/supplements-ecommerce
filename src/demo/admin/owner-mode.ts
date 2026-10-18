/**
 * Modo dueño en la tienda (R4c, módulo puro): qué se puede editar en cada pantalla de la tienda, a qué pantalla exacta
 * del panel lleva cada punto y cuándo aparece el interruptor. El interruptor solo existe si se llegó desde el panel o
 * con `?dueno=1` (y se recuerda en la pestaña): el comprador normal nunca lo ve. `?dueno=0` lo saca.
 */
const P = "/admin-demo";

export type OwnerSpotId =
  | "carrusel" | "categorias" | "campana" | "packs" | "textos" | "club"
  | "ficha" | "preguntas" | "stack" | "juego" | "regalos" | "contacto";

/** Lo que cambia la pantalla de destino: el producto de la ficha o la campaña que se está mostrando. */
export interface SpotContext { slug?: string; campaignId?: string }

export interface OwnerSpot {
  id: OwnerSpotId;
  /** Qué se edita, como lo dice el dueño. */
  label: string;
  /** Dónde queda en el panel (sección · pestaña). */
  where: string;
  href: string;
}

/** `general`: el rótulo cuando falta el contexto (sin campaña activa, el punto lleva al calendario de campañas). */
interface SpotDef { label: string; where: string; general?: string; path: (ctx: SpotContext) => string }

const fixed = (path: string) => () => path;

export const OWNER_SPOTS: Record<OwnerSpotId, SpotDef> = {
  carrusel: { label: "Carrusel del inicio", where: "Ajustes · Contenido · Carrusel", path: fixed("/contenido/carrusel/") },
  categorias: { label: "Categorías", where: "Stock · Categorías", path: fixed("/categorias/") },
  campana: {
    label: "Campaña activa",
    general: "Campañas y temáticas",
    where: "Campañas",
    path: (c) => (c.campaignId ? `/campanas/editar/?id=${encodeURIComponent(c.campaignId)}` : "/campanas/"),
  },
  packs: { label: "Packs", where: "Stock · Packs", path: fixed("/packs/") },
  textos: { label: "Textos de inicio", where: "Ajustes · Contenido · Textos de inicio", path: fixed("/contenido/textos/") },
  club: { label: "Misiones del club", where: "Promos · Misiones", path: fixed("/misiones/") },
  ficha: {
    label: "Precio y stock de este producto",
    where: "Stock · Editar producto",
    path: (c) => (c.slug ? `/productos/editar/?id=${encodeURIComponent(c.slug)}` : "/productos/"),
  },
  preguntas: { label: "Preguntas frecuentes", where: "Ajustes · Contenido · Preguntas frecuentes", path: fixed("/contenido/preguntas/") },
  stack: { label: "Descuento stack", where: "Promos · Descuento stack", path: fixed("/descuento-stack/") },
  juego: { label: "Premios del juego", where: "Promos · Premios del juego", path: fixed("/cupones/juego/") },
  regalos: { label: "Regalos y gift cards", where: "Promos · Regalos y gift cards", path: fixed("/regalos/") },
  contacto: { label: "WhatsApp, horarios y contacto", where: "Ajustes · Contacto", path: fixed("/ajustes/") },
};

/** Ruta del panel (sin basePath) donde se edita ese punto. */
export function ownerSpotHref(id: OwnerSpotId, ctx: SpotContext = {}): string {
  return `${P}${OWNER_SPOTS[id].path(ctx)}`;
}

export function ownerSpot(id: OwnerSpotId, ctx: SpotContext = {}): OwnerSpot {
  const def = OWNER_SPOTS[id];
  const label = def.general && !ctx.slug && !ctx.campaignId ? def.general : def.label;
  return { id, label, where: def.where, href: ownerSpotHref(id, ctx) };
}

/** Puntos de cada pantalla de la tienda (`*` al final: cualquier ruta debajo). El pie (contacto) está en todas. */
export const SPOTS_BY_PAGE: { path: string; spots: OwnerSpotId[] }[] = [
  { path: "/", spots: ["carrusel", "categorias", "campana", "packs", "textos", "club"] },
  { path: "/p/*", spots: ["ficha"] },
  { path: "/preguntas", spots: ["preguntas"] },
  { path: "/campana", spots: ["campana"] },
  { path: "/crear", spots: ["stack"] },
  { path: "/club/juego", spots: ["juego"] },
  { path: "/regalar", spots: ["regalos"] },
];
export const GLOBAL_SPOTS: OwnerSpotId[] = ["contacto"];

const clean = (pathname: string) => pathname.split(/[?#]/)[0]!.replace(/\/+$/, "") || "/";

/** Puntos editables de una pantalla de la tienda, en el orden en que aparecen. */
export function spotsForPath(pathname: string): OwnerSpotId[] {
  const path = clean(pathname);
  const page = SPOTS_BY_PAGE.find((p) => (p.path.endsWith("/*") ? path.startsWith(p.path.slice(0, -1)) : path === p.path));
  return [...(page?.spots ?? []), ...GLOBAL_SPOTS];
}

/** Ficha del pedido en el panel (Pedidos → Todos → detalle). */
export const orderPanelHref = (code: string) => `${P}/pedidos/detalle/?codigo=${encodeURIComponent(code)}`;

/** Desde el panel: la tienda con el modo dueño prendido. */
export const OWNER_STORE_HREF = "/?dueno=1";

// --- Sesión: si el interruptor está disponible y si está prendido ---

export interface OwnerSession { available: boolean; on: boolean }
export const OWNER_OFF: OwnerSession = { available: false, on: false };

/** Lo guardado en la pestaña, tolerante a basura: sin interruptor disponible nunca queda prendido. */
export function parseOwnerSession(raw: string | null): OwnerSession {
  if (!raw) return OWNER_OFF;
  try {
    const v = JSON.parse(raw) as Partial<OwnerSession> | null;
    const available = v?.available === true;
    return { available, on: available && v?.on === true };
  } catch {
    return OWNER_OFF;
  }
}

/** `?dueno=1` (o `si`) prende el modo dueño; `?dueno=0` (o `no`) lo saca del todo; cualquier otra cosa no cambia nada. */
export function ownerParam(search: string): "on" | "off" | null {
  const v = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("dueno")?.trim().toLowerCase();
  if (v === "1" || v === "si" || v === "sí" || v === "true") return "on";
  if (v === "0" || v === "no" || v === "false") return "off";
  return null;
}

export function applyOwnerParam(s: OwnerSession, param: "on" | "off" | null): OwnerSession {
  if (param === "on") return { available: true, on: true };
  if (param === "off") return OWNER_OFF;
  return s;
}

/** Pasar por el panel deja el interruptor disponible en la tienda (apagado, si no estaba prendido). */
export const visitedPanel = (s: OwnerSession): OwnerSession => ({ available: true, on: s.on });

export const toggleOwner = (s: OwnerSession): OwnerSession => (s.available ? { available: true, on: !s.on } : s);
