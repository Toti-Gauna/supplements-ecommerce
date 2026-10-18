import baseCampaign from "./data/base-campaign.json";
import launchPack from "./data/launch-pack-draft.json";
import prices from "./data/prices.v2026-10-16.json";
import { buildPriceBook, type Offer, type PriceBook, type Prices } from "./pricing";

/** Dólar de referencia que pidió Ignacio para mostrar los precios en pesos (18/10/2026). */
export const USD_RATE = 1500;

/** Libro de precios de "Tu tienda": primero la campaña base, después el pack de lanzamiento, los planes y los extras. */
export const TU_TIENDA_BOOK = buildPriceBook({ prices: prices as Prices, offers: [baseCampaign as Offer, launchPack as Offer], product: "Tu tienda", rate: USD_RATE });

/** Libros disponibles para la escena de precios (otro producto de Eclipse = otra entrada acá). */
export const BOOKS: Record<string, PriceBook> = { "tu-tienda": TU_TIENDA_BOOK };
