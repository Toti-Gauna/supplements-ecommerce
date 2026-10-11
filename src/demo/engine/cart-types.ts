import type { CollarConfig } from "../fixtures/collar";
import type { GiftOccasion, PersonalizationKind } from "../types";

export interface LinePersonalization {
  kind: PersonalizationKind;
  text?: string;
  font?: string;
  color?: string;
  colorName?: string;
  notes?: string;
  /** Vista previa aprobada (data URL generado en el navegador). Nunca se sube a ningún servidor en la demo. */
  previewDataUrl?: string;
  /** Miniatura de la foto de referencia (solo navegador). */
  referenceDataUrl?: string;
  approvedAt: string;
  /** Configuración del collar (solo productos con configurador). */
  collar?: CollarConfig;
}

/** El producto se compra para regalar (pedido de Ignacio, fuera de la especificación). */
export interface LineGift {
  to: string;
  from: string;
  /** Si es el email de una cuenta, el regalo le aparece ahí sin abrir el link. */
  toEmail?: string;
  message: string;
  occasion: GiftOccasion;
}

export interface CartLine {
  id: string;
  productSlug: string;
  variantId: string;
  quantity: number;
  personalization?: LinePersonalization;
  gift?: LineGift;
}
