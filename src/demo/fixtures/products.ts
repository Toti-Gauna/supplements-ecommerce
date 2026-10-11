import type { Product } from "../types";
import { performanceProducts } from "./products-performance";
import { proteinProducts } from "./products-protein";
import { wellnessProducts } from "./products-wellness";

export const products: Product[] = [...proteinProducts, ...performanceProducts, ...wellnessProducts];
