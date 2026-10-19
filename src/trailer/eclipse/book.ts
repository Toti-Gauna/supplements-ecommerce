import baseCampaign from "./data/base-campaign.json";
import launchPack from "./data/launch-pack-draft.json";
import prices from "./data/prices.v2026-10-16.json";
import { SALES_BOOK } from "./offer";
import { buildPriceBook, USD_RATE, type Offer, type PriceBook, type Prices } from "./pricing";

export { USD_RATE };

/** Libro de precios de "Tu tienda": primero la campaña base, después el pack de lanzamiento, los planes y los extras. */
export const TU_TIENDA_BOOK = buildPriceBook({ prices: prices as Prices, offers: [baseCampaign as Offer, launchPack as Offer], product: "Tu tienda", rate: USD_RATE });

/** Libros disponibles para la escena de precios (otro producto de Eclipse = otra entrada acá). */
export const BOOKS: Record<string, PriceBook> = { "tu-tienda": TU_TIENDA_BOOK, "tu-tienda-ventas": SALES_BOOK };
