/**
 * Reseñas de MUESTRA (ficticias) por atributo: sabor, mezcla y efecto, de 1 a 5. En producción salen de las reseñas
 * de compradores verificados. Nombres inventados: solo nombre e inicial.
 */
export type ReviewAttribute = "sabor" | "mezcla" | "efecto";

export interface ProductReviews {
  productSlug: string;
  /** Cantidad de reseñas que promedian estas notas. */
  count: number;
  scores: Record<ReviewAttribute, number>;
  quote: { text: string; author: string; flavor?: string };
}

export const sampleReviews: ProductReviews[] = [
  { productSlug: "ionic-whey", count: 128, scores: { sabor: 4.7, mezcla: 4.8, efecto: 4.5 }, quote: { text: "Se disuelve con el shaker en dos sacudidas y el de chocolate no empalaga.", author: "Martina G.", flavor: "Chocolate" } },
  { productSlug: "creatina-monohidrato", count: 96, scores: { sabor: 4.1, mezcla: 4.4, efecto: 4.8 }, quote: { text: "Sin sabor de verdad: la mezclo con el jugo de la mañana y listo.", author: "Nicolás R." } },
  { productSlug: "overvolt-pre", count: 64, scores: { sabor: 4.5, mezcla: 4.2, efecto: 4.7 }, quote: { text: "Pega suave y no me deja temblando. El de frutos rojos es el mejor.", author: "Lucas P.", flavor: "Frutos rojos" } },
  { productSlug: "isolate-zero", count: 41, scores: { sabor: 4.4, mezcla: 4.9, efecto: 4.5 }, quote: { text: "Cero grumos y me cae bien aunque soy intolerante a la lactosa.", author: "Carla M.", flavor: "Vainilla" } },
  { productSlug: "proteina-vegana", count: 27, scores: { sabor: 3.9, mezcla: 4.0, efecto: 4.3 }, quote: { text: "Para ser vegetal está muy bien; con leche de almendras queda mejor.", author: "Juana T.", flavor: "Chocolate" } },
];

export const REVIEW_ATTRIBUTES: { key: ReviewAttribute; label: string }[] = [
  { key: "sabor", label: "Sabor" },
  { key: "mezcla", label: "Mezcla" },
  { key: "efecto", label: "Efecto" },
];
