/**
 * Estudio de contenido: formatos de Instagram, plantillas de VOLTA (oferta, producto destacado, stack del mes y cupón
 * del juego), ganchos para Reels y textos fijos de marca. Los ganchos son propuestas sin testear: el dueño mide cuál
 * retiene más en los primeros 3 segundos.
 */
import { DISPATCH_PROMISE } from "../engine/lead-time";
import { brand } from "@/config/brand";

export type StudioFormat = "post" | "story" | "carousel";

export const STUDIO_FORMATS: { id: StudioFormat; name: string; size: [number, number]; ratio: string; hint: string }[] = [
  { id: "post", name: "Post", size: [1080, 1080], ratio: "1:1", hint: "Para el feed: imagen o video corto." },
  { id: "story", name: "Historia o reel", size: [1080, 1920], ratio: "9:16", hint: "Pantalla completa: ideal en video, con los potes entrando uno por uno." },
  { id: "carousel", name: "Carrusel", size: [1080, 1350], ratio: "4:5", hint: "Portada, productos con precio, cómo pedir y el cierre." },
];

export type StudioTemplate = "offer" | "product" | "stack" | "game";

export const STUDIO_TEMPLATES: { id: StudioTemplate; name: string; hint: string; slug: string; maxProducts: number }[] = [
  { id: "offer", name: "Oferta de la fecha", hint: "El cupón de la temática vigente con sus productos en oferta.", slug: "oferta", maxProducts: 3 },
  { id: "product", name: "Producto destacado", hint: "Un pote con su precio por servicio, lote y vencimiento.", slug: "producto", maxProducts: 1 },
  { id: "stack", name: "Stack del mes", hint: "Tres potes en el estante con el descuento stack.", slug: "stack", maxProducts: 3 },
  { id: "game", name: "Cupón del juego", hint: "Shaker Rush: jugá y ganá tu cupón según el puntaje.", slug: "juego", maxProducts: 0 },
];

export interface StudioHook {
  id: string;
  /** Formato del video según la página de mejoras. */
  name: string;
  /** Primeros 3 segundos. */
  hook: string;
  /** Cierre que pide un comentario (funciona mejor que pedir likes). */
  closer: string;
  /** Categorías de producto donde aplica; vacío = cualquiera. */
  categories: string[];
  /** Plantillas donde aplica; sin esto, en todas las que tienen productos. */
  templates?: StudioTemplate[];
}

export const STUDIO_HOOKS: StudioHook[] = [
  { id: "mito", name: "Mito", hook: "No, la creatina no te hace retener agua debajo de la piel.", closer: "Comentá {KEYWORD} y te paso cómo tomarla.", categories: ["creatinas"] },
  { id: "scoop", name: "Prueba en cámara", hook: "Mirá cómo se disuelve en 10 segundos. Sin grumos.", closer: "Comentá {KEYWORD} y te mandamos el link.", categories: ["proteinas", "ganadores"] },
  { id: "pre", name: "Antes y después del pre", hook: "Llegué del laburo sin ganas… y a los 20 minutos esto.", closer: "Comentá {KEYWORD} y te digo cuál te conviene.", categories: ["pre-entrenos"] },
  { id: "precio", name: "Precio por servicio", hook: "¿Cuánto te sale cada scoop de verdad? Hicimos la cuenta.", closer: "Comentá {KEYWORD} y te pasamos la tabla.", categories: [] },
  { id: "stack", name: "Stack del cliente", hook: "Un cliente nos pidió esto para ganar masa. Este es su stack.", closer: "Comentá STACK y te armamos el tuyo.", categories: [], templates: ["stack", "offer"] },
  { id: "lote", name: "Original", hook: "Cómo saber si tu suplemento es original en 3 segundos.", closer: "Todos nuestros potes tienen lote y vencimiento a la vista. Link en la bio.", categories: [] },
  { id: "snack", name: "Antojo", hook: "Alfajor con 15 g de proteína. Sí, existe.", closer: "Comentá {KEYWORD} y te lo mandamos hoy.", categories: ["snacks"] },
  { id: "juego", name: "Reto", hook: "¿Llegás a 1.500 puntos en 45 segundos? Te reto.", closer: "Comentá tu puntaje y probá en la tienda: el cupón es tuyo.", categories: [], templates: ["game"] },
  { id: "juego-premio", name: "Premio", hook: "Jugás 45 segundos y te llevás un descuento. Así de simple.", closer: "Entrá a la tienda → Club → Shaker Rush. Un cupón por día.", categories: [], templates: ["game"] },
];

/** Palabra para pedir en comentarios (el DM automático responde con el link a esa línea). */
export const STUDIO_KEYWORDS: Record<string, string> = {
  proteinas: "WHEY", creatinas: "CREATINA", "pre-entrenos": "PRE", aminoacidos: "BCAA", ganadores: "MASA", definicion: "DEFINIR",
  salud: "SALUD", snacks: "SNACK", hidratacion: "HIDRATAR", accesorios: "SHAKER", indumentaria: "ROPA",
};

/** "Cómo pedir el tuyo en 4 pasos" y, en el juego, cómo ganar el cupón. */
export const STUDIO_STEPS = ["Elegí tu objetivo y tu sabor", "Mirá cuánto te dura el pote", "Pagá como prefieras", "Te llega hoy en Mar del Plata"];
export const STUDIO_GAME_STEPS = ["Entrá al Club de la tienda", "Atrapá scoops y esquivá la chatarra", "Tu puntaje carga el shaker", "El cupón va directo al carrito"];

/** Consejos de publicación (horario, comentarios, hashtags, link en la bio). */
export const STUDIO_TIPS = [
  "Publicalo entre las 19 y las 21 h: dos tercios de las vistas de un reel llegan en 3 días.",
  "Pedí un comentario con una palabra; pedir likes no funciona y los hashtags rinden poco.",
  "El link de la bio va a la tienda, no a WhatsApp.",
];

/** Textos de marca (nombre y ciudad salen de la configuración de la marca; en producción, de la tabla Setting). */
export const STUDIO_BRAND = {
  name: brand.name, city: brand.city, handle: brand.instagram ? `@${brand.instagram}` : brand.name,
  eyebrow: `${brand.name} · ${brand.city}`, title: "Cargá tu mejor versión",
  subtitle: `Suplementos originales con lote y vencimiento a la vista. Cadete en ${brand.city} ${DISPATCH_PROMISE}.`, cta: "Pedilo en la tienda · link en la bio",
  seal: "Originales", closing: `Link en la bio · Cadete ${DISPATCH_PROMISE} y envíos a todo el país.`,
};
