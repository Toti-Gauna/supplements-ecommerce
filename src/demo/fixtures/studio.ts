/**
 * Estudio de contenido (Fase 6, pedido de Ignacio, fuera de la especificación): formatos de Instagram, ganchos para
 * Reels y carruseles tomados de la página "Mejoras y diferenciación" de Notion, y textos fijos de marca.
 * Los ganchos son propuestas sin testear: el dueño mide cuál retiene más en los primeros 3 segundos.
 */
import { brand } from "@/config/brand";

export type StudioFormat = "post" | "story" | "carousel";

export const STUDIO_FORMATS: { id: StudioFormat; name: string; size: [number, number]; ratio: string; hint: string }[] = [
  { id: "post", name: "Post", size: [1080, 1080], ratio: "1:1", hint: "Para el feed: imagen o video corto." },
  { id: "story", name: "Historia o reel", size: [1080, 1920], ratio: "9:16", hint: "Pantalla completa: ideal en video, con los productos uno por uno." },
  { id: "carousel", name: "Carrusel", size: [1080, 1350], ratio: "4:5", hint: "Portada, productos con precio, cómo pedir y la oferta." },
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
  /** Solo para productos personalizables. */
  personalizable?: boolean;
}

export const STUDIO_HOOKS: StudioHook[] = [
  { id: "foto", name: "De la foto al producto", hook: "Me mandaron esta foto… y mirá en qué la convertimos.", closer: "Comentá {KEYWORD} y te paso cómo pedir el tuyo.", categories: ["iluminacion", "deco"], personalizable: true },
  { id: "pov", name: "Reacción del perro", hook: "POV: te dieron el plato más lindo del barrio.", closer: "Elegí el color del tuyo en la tienda.", categories: ["comederos"] },
  { id: "collar", name: "Reacción del perro", hook: "POV: estrenás collar con tu nombre y todo el parque te mira.", closer: "Comentá {KEYWORD} y armá el tuyo con vista previa.", categories: ["collares"] },
  { id: "casi", name: "Pedido de un cliente", hook: "Este pedido casi lo hago mal…", closer: "Ahora ves tu pieza antes de pagar. Comentá {KEYWORD}.", categories: [], personalizable: true },
  { id: "nfc", name: "NFC", hook: "Mirá lo que pasa si acercás el celu.", closer: "Comentá NFC y te cuento cómo funciona.", categories: ["placas-nfc"] },
  { id: "proceso", name: "Proceso", hook: "Así nace tu pieza, de la máquina a tu casa.", closer: "Comentá {KEYWORD} y te mostramos la tuya terminada.", categories: [] },
  { id: "mito", name: "Mito", hook: "No, no es plástico barato.", closer: "Precio y plazo de fabricación en la tienda: link en la bio.", categories: ["comederos", "deco", "souvenirs"] },
];

/** Palabra para pedir en comentarios (el DM automático responde con el link a esa línea). */
export const STUDIO_KEYWORDS: Record<string, string> = {
  iluminacion: "LAMPARA", comederos: "COMEDERO", collares: "COLLAR", "placas-nfc": "NFC", velas: "VELA", hogar: "AROMA",
  deco: "DECO", souvenirs: "SOUVENIR", emprendedores: "GUIA", tablas: "TABLA",
};

/** "Cómo pedir el tuyo en 4 pasos" (carrusel sugerido en la página de mejoras). */
export const STUDIO_STEPS = ["Elegí tu pieza y subí tu foto", "Mirá la vista previa y aprobala", "Pagá como prefieras", "Seguí tu pedido hasta tu casa"];

/** Consejos de publicación (página de mejoras: horario, comentarios, hashtags, link en la bio). */
export const STUDIO_TIPS = [
  "Publicalo entre las 19 y las 21 h: dos tercios de las vistas de un reel llegan en 3 días.",
  "Pedí un comentario con una palabra; pedir likes no funciona y los hashtags rinden poco.",
  "El link de la bio va a la tienda, no a WhatsApp.",
];

/** Textos de marca (nombre y ciudad salen de la configuración de la marca; en producción, de la tabla Setting). */
export const STUDIO_BRAND = {
  name: brand.name, city: brand.city, eyebrow: `${brand.name} · ${brand.city}`, title: "Objetos con alma",
  subtitle: `Hechos a mano en ${brand.city}, con el nombre o la foto que quieras.`, cta: "Pedilo en la tienda · link en la bio",
  handMade: "Hecho a mano", closing: "Link en la bio · Envíos y retiro: mirá las opciones en la tienda.",
};
