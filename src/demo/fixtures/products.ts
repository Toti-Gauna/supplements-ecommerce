import type { Product } from "../types";
import { withLots } from "./lots";
import { performanceProducts } from "./products-performance";
import { proteinProducts } from "./products-protein";
import { wellnessProducts } from "./products-wellness";

/** Catálogo de muestra con sus lotes por variante (el stock de cada variante es la suma de sus lotes). */
export const products: Product[] = withLots([...proteinProducts, ...performanceProducts, ...wellnessProducts]);
