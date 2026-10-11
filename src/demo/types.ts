import type { CollarSpec } from "./fixtures/collar";
import type { ContainerKind, PackStyle } from "@/components/illustrations/supplements/types";

export type { PackStyle };

/** Tipos del catálogo de demo. Espejan el modelo de la especificación técnica (sección 4). */

export type PersonalizationKind = "TEXT" | "PHOTO" | "PHOTO_REFERENCE";
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
}

export interface Faq {
  q: string;
  a: string;
}

export type PhotoMask = "arch" | "circle" | "rounded";

export interface PersonalizationTemplate {
  id: string;
  name: string;
  kind: PersonalizationKind;
  /** Silueta que recorta la foto (solo PHOTO). */
  mask?: PhotoMask;
  maxChars?: number;
  fonts?: string[];
  colors?: { name: string; hex: string }[];
  surcharge: number;
  notesPlaceholder?: string;
  /** Configurador de collar (formato, material, cordón, dije y talle). Pedido de Ignacio, fuera de la spec. */
  collar?: CollarSpec;
}

/** Objetivos de entrenamiento: filtran el catálogo y arman stacks. */
export type Goal = "masa-muscular" | "fuerza" | "energia" | "recuperacion" | "definicion" | "salud" | "resistencia";

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
  personalization?: PersonalizationTemplate;
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
  /** Lote y vencimiento de muestra (AAAA-MM). */
  lot?: { code: string; expires: string };
  /** Nombres de las opciones en la ficha (por defecto "Sabor" y "Tamaño"). */
  optionNames?: { color?: string; size?: string };
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

/** Imagen propia de una diapositiva (8.3.28): optimizada en el navegador, con su descripción y encuadre. */
export interface SlideImage {
  src: string;
  alt: string;
  /** Punto que queda a la vista, en % del ancho y del alto. */
  x: number;
  y: number;
  /** Acercamiento, de 1 a 2. */
  zoom: number;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  /** Ilustración de la demo; se usa si no hay imagen propia. */
  art: ArtKey;
  image?: SlideImage;
  active?: boolean;
}

/** Festividades comerciales con temática propia (pedido de Ignacio, fuera de la especificación). */
export type SeasonId =
  | "san-valentin" | "pascuas" | "dia-del-animal" | "hot-sale" | "revolucion-de-mayo" | "dia-del-padre" | "dia-de-la-bandera"
  | "dia-de-la-independencia" | "dia-del-amigo" | "dia-del-nino" | "dia-de-la-madre" | "halloween" | "orgullo" | "black-friday"
  | "navidad" | "ano-nuevo";

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
}

export interface ThemeSettings {
  /** auto: según la fecha · fixed: siempre la elegida · off: sin temática. */
  mode: "auto" | "fixed" | "off";
  fixedId: SeasonId;
  /** Muestra el botón "Probar temáticas" en la tienda (para mostrarle la demo al cliente). */
  showTryButton: boolean;
}
