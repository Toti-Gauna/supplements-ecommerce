import type { ContainerKind, PackStyle } from "@/components/illustrations/supplements/types";

export type { PackStyle };

/** Tipos del catálogo de demo. Espejan el modelo de la especificación técnica (sección 4). */

export type PaymentMethod = "CHECKOUT_PRO" | "BANK_TRANSFER" | "QR_MANUAL";
export type FulfillmentType = "PICKUP" | "LOCAL_DELIVERY" | "SHIPPING";
/** Envase de la ilustración (librería SVG de suplementos, `src/components/illustrations/supplements`). */
export type ArtKey = ContainerKind;
export type ArtView = "front" | "detail" | "context";

export interface Category {
  slug: string;
  name: string;
  description: string;
  art: ArtKey;
  featured: boolean;
  sortOrder: number;
  /** "gear": equipamiento (straps, guantes, shakers…): sin servicios, lote ni vencimiento; se elige por color y talle. */
  kind?: "gear";
}

export interface Variant {
  id: string;
  label: string;
  /** Sabor (o color en accesorios). Se elige con una muestra de color. */
  color?: string;
  colorHex?: string;
  /** Tamaño o presentación (1 lb, 2 lb, 60 cápsulas…). */
  size?: string;
  /** Servicios que trae esta presentación (precio por servicio y "cuánto te dura"). */
  servings?: number;
  priceDelta: number;
  /** -1 = a pedido (sin límite), 0 = sin stock */
  stock: number;
  /** Plazo de fabricación propio de la variante, en días hábiles (si no, el del producto). */
  leadDays?: number;
  /** Lotes en el local. Con lotes, el stock es la suma de sus unidades y sale primero el que vence primero (FEFO). */
  lots?: Lot[];
  /** Costo del proveedor por unidad (pesos enteros). Lo actualiza la lista de precios del proveedor. */
  cost?: number;
}

/** Lote de una variante: código del envase, vencimiento AAAA-MM (vence el último día del mes) y unidades. */
export interface Lot {
  code: string;
  expires: string;
  units: number;
  /** Liquidación por vencimiento: % de descuento mientras este lote sea el que sale primero. */
  clearancePct?: number;
  /** Día en que el lote entró al local (AAAA-MM-DD). Lo muestra "Verificá tu lote". */
  receivedOn?: string;
}

export interface Faq {
  q: string;
  a: string;
}

/** Temas de la ayuda del box (R2c): agrupan las preguntas frecuentes de la tienda. */
export type FaqTopic = "compras" | "envios" | "pagos" | "cambios" | "suplementos" | "equipamiento" | "club";

/** Pregunta frecuente de la tienda (se edita en el panel → Contenido → Preguntas frecuentes). */
export interface StoreFaq extends Faq {
  topic: FaqTopic;
}

/** Objetivos de entrenamiento: filtran el catálogo y arman stacks. */
export type Goal = "masa-muscular" | "fuerza" | "energia" | "recuperacion" | "definicion" | "salud" | "resistencia";

/** Deportes (L4): el quiz, el armador y "Entrená por objetivo" también arman por deporte. */
export type SportId =
  | "futbol" | "tenis" | "padel" | "running" | "ciclismo" | "natacion"
  | "boxeo" | "crossfit" | "basquet" | "rugby" | "hockey" | "voley";

/** Sellos del rótulo. */
export type ProductBadge = "sin-tacc" | "vegano" | "sin-azucar" | "keto" | "marca-propia" | "sin-cafeina";

/** Momento del día en que se toma (línea de "Cómo tomarlo"). */
export type UsageMoment = "manana" | "pre" | "intra" | "post" | "noche" | "comida";

export interface NutritionRow {
  label: string;
  /** Por porción, con unidad ("24 g"). */
  serving: string;
  /** Por 100 g, si aplica. */
  per100?: string;
  /** % del valor diario. */
  dv?: string;
  /** Subrenglón (saturadas, trans, azúcares). */
  sub?: boolean;
}

/** Información nutricional con formato de rótulo argentino. Valores de MUESTRA. */
export interface Nutrition {
  /** "1 scoop (30 g)". */
  serving: string;
  rows: NutritionRow[];
  ingredients: string;
  allergens?: string;
  /** Leyenda del rótulo, p. ej. "No aporta cantidades significativas de…" (CAA) cuando todo da cero. */
  note?: string;
}

export interface Usage {
  moments: UsageMoment[];
  /** Cómo se prepara o se toma, en una frase. */
  text: string;
  /** Gramos (o unidades) por servicio. */
  dose?: string;
}

export interface Product {
  slug: string;
  name: string;
  short: string;
  description: string;
  categorySlug: string;
  /** Marca (propia o de muestra). */
  brand: string;
  basePrice: number;
  madeToOrderDays?: number;
  art: ArtKey;
  gallery: ArtView[];
  variants: Variant[];
  faqs: Faq[];
  featured: boolean;
  isNew: boolean;
  soldCount: number;
  tags: string[];
  /** false = oculto en la tienda (se edita desde el panel). Por defecto true. */
  active?: boolean;
  imageAlt?: string;
  /** Foto cargada desde el panel demo (data URL, solo en este navegador). */
  photoDataUrl?: string;
  dims?: { lengthCm: number; widthCm: number; heightCm: number; weightG: number };
  /** Envase de la marca (ilustración). Sin esto, el de la marca propia. */
  pack?: PackStyle;
  goals?: Goal[];
  badges?: ProductBadge[];
  nutrition?: Nutrition;
  usage?: Usage;
  /** Registro del producto alimenticio (RNPA) que figura en el rótulo. */
  rnpa?: string;
  /** Lote representativo del producto (AAAA-MM). El de cada variante está en `variants[].lots`. */
  lot?: { code: string; expires: string };
  /** Nombres de las opciones en la ficha (por defecto "Sabor" y "Tamaño"). */
  optionNames?: { color?: string; size?: string };
}

/** Un producto del pack: variante fija o, sin ella, la primera con stock. */
export interface PackItem {
  productSlug: string;
  variantId?: string;
  qty: number;
}

/**
 * Pack (L3): productos pensados para un objetivo o un deporte, con descuento por llevar todo junto y un extra por
 * recibirlo todos los meses. Los suplementos se repiten cada mes; el equipamiento (no se consume) viaja solo en la primera entrega.
 */
export interface Pack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Para qué es: un objetivo ("Masa muscular") o un deporte ("Fútbol"). */
  focus: string;
  items: PackItem[];
  /** % por llevar todo junto. */
  discountPct: number;
  /** % extra por recibirlo todos los meses. */
  monthlyPct: number;
  featured: boolean;
  active?: boolean;
  /** Pack armado a medida por el quiz ("Tu programa", L4): no está en el catálogo, viaja con el carrito y la suscripción. */
  custom?: boolean;
}

export interface Coupon {
  code: string;
  type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minSubtotal?: number;
  onlyRegistered?: boolean;
  endsAt?: string;
  description: string;
  active?: boolean;
  maxUses?: number;
  /** Usos simulados. */
  usedCount?: number;
  /** Cupón de una temática: en "Mis cupones" solo aparece mientras esa temática está puesta. */
  themeId?: SeasonId;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "UNITS_COUNT" | "ORDERS_COUNT" | "SPEND_TOTAL";
  threshold: number;
  reward: string;
  active?: boolean;
  /** Misión siguiente de la cadena: el excedente pasa a esa misión (spec 5.6). */
  nextMissionId?: string | null;
  /** Clientes que la completaron (muestra). */
  completedCount?: number;
}

export interface ShippingZone {
  id: string;
  type: FulfillmentType;
  name: string;
  price: number | null;
  etaText: string;
  postalCodes?: string[];
  active?: boolean;
}

/**
 * Diapositiva del carrusel del inicio: producto en el rack, titular y bajada. La campaña vigente va primera.
 */
export interface HeroImageFrame { x: number; y: number; zoom: number }
export interface HeroImage { src: string; alt: string; frame: HeroImageFrame }

export interface HeroFeature {
  id: string;
  productSlug: string;
  headline: string;
  pitch: string;
  active?: boolean;
  /** Imagen propia optimizada: data URL local que nunca sale del navegador. */
  image?: HeroImage;
}

/** Fechas comerciales con temática fitness propia (Fase 5, docs/plan-por-fases.md). */
export type SeasonId =
  | "dia-de-la-madre" | "halloween" | "cyber-monday" | "black-friday" | "navidad" | "ano-nuevo"
  | "san-valentin" | "vuelta-al-gym" | "hot-sale" | "dia-del-padre" | "dia-del-amigo" | "operacion-verano"
  // Días del deporte (R3a, punto 9 del pedido de Ignacio).
  | "crossfit-open" | "dia-actividad-fisica" | "dia-del-futbolista" | "dia-del-running" | "dia-del-boxeador";

/** Ocasión de un regalo: una festividad o Volta sin temática (define la escena con la que se abre). */
export type GiftOccasion = SeasonId | "volta";

/** Contenido editable de una temática. Lo visual (colores y decoraciones) es fijo por festividad. */
export interface SeasonalTheme {
  id: SeasonId;
  name: string;
  /** Habilitada para el modo automático y para "Probar temáticas". */
  active: boolean;
  /** Fechas (AAAA-MM-DD). Se repite cada año: solo cuentan mes y día. */
  startsOn: string;
  endsOn: string;
  headline: string;
  subtitle: string;
  /** Texto de la cinta superior. */
  ribbon: string;
  /** Cupón de la oferta (de la lista de cupones). */
  couponCode: string;
  /** Productos en oferta, en orden. */
  productSlugs: string[];
  /** Día del deporte (R3a) en vez de fecha comercial: la campaña habla de entrenar, no de regalar. */
  sport?: boolean;
  /** Fecha de descuento fuerte (Black Friday, CyberMonday, Hot Sale): antes del inicio, la tienda muestra la sala de espera. */
  waitingRoom?: boolean;
}

export interface ThemeSettings {
  /** auto: según la fecha · fixed: siempre la elegida · off: sin temática. */
  mode: "auto" | "fixed" | "off";
  fixedId: SeasonId;
  /** Muestra el botón "Probar temáticas" en la tienda (para mostrarle la demo al cliente). */
  showTryButton: boolean;
}
