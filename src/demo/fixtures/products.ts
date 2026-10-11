import type { Product } from "../types";
import { homeProducts } from "./products-home";
import { petProducts } from "./products-pets";

export const products: Product[] = [...petProducts, ...homeProducts];
