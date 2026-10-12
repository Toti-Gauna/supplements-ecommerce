import type { Coupon, SeasonalTheme, ThemeSettings } from "../types";

/**
 * Temáticas fitness de MUESTRA para las fechas comerciales de Argentina (Fase 5, docs/plan-por-fases.md).
 * Fechas aproximadas de octubre de 2026 a septiembre de 2027; se repiten cada año (solo cuentan mes y día) y se
 * ajustan desde el panel. Ninguna fecha cae en dos temáticas a la vez. Lo visual de cada una vive en
 * `src/features/themes/` (paleta, piel, fondo y pantalla de carga); acá van los textos, el cupón y las ofertas.
 */
export const seasonalThemes: SeasonalTheme[] = [
  { id: "dia-de-la-madre", name: "Día de la Madre", active: true, startsOn: "2026-10-01", endsOn: "2026-10-18", headline: "Para la que nunca para", subtitle: "Colágeno, omega 3 y vitaminas: regalale energía para todo el año.", ribbon: "Día de la Madre: 15% OFF para regalarle energía", couponCode: "MAMA15", productSlugs: ["colageno", "omega-3", "multivitaminico", "isolate-zero", "magnesio-bisglicinato"] },
  { id: "halloween", name: "Halloween", active: true, startsOn: "2026-10-19", endsOn: "2026-10-31", headline: "Monster pump", subtitle: "Pre-entrenos que dan miedo (del bueno) y dulces proteicos para el truco o trato.", ribbon: "Halloween: 20% OFF en modo monstruo", couponCode: "MONSTER20", productSlugs: ["overvolt-pre", "pump-flow", "mass-gainer", "alfajor-proteico", "creatina-gomitas"] },
  { id: "cyber-monday", name: "CyberMonday", active: true, startsOn: "2026-11-02", endsOn: "2026-11-04", headline: "Overclock de precios", subtitle: "72 horas con los más vendidos a precio de laboratorio. Se apaga el miércoles.", ribbon: "CyberMonday: 25% OFF por 72 horas", couponCode: "CYBER25", productSlugs: ["ionic-whey", "creatina-monohidrato", "isolate-zero", "bcaa-211", "electrolitos"] },
  { id: "black-friday", name: "Black Friday", active: true, startsOn: "2026-11-23", endsOn: "2026-11-30", headline: "Negro total, precios en volt", subtitle: "La semana más fuerte del año: proteínas, creatinas y ganadores con el mayor descuento.", ribbon: "Black Friday: 30% OFF desde $40.000", couponCode: "BLACK30", productSlugs: ["isolate-zero", "ionic-whey", "mass-gainer", "creatina-monohidrato", "overvolt-pre"] },
  { id: "navidad", name: "Navidad", active: true, startsOn: "2026-12-01", endsOn: "2026-12-25", headline: "Este año, Papá Noel entrena", subtitle: "Shakers, creatina y alfajores proteicos. Pedilo antes del 20 y llega para Nochebuena.", ribbon: "Navidad: 15% OFF para el arbolito", couponCode: "NAVIDAD15", productSlugs: ["shaker-volta", "creatina-monohidrato", "alfajor-proteico", "ionic-whey", "barra-proteica"] },
  { id: "ano-nuevo", name: "Año Nuevo", active: true, startsOn: "2026-12-26", endsOn: "2027-01-06", headline: "Versión 2027 instalada", subtitle: "Actualizá la rutina: creatina, proteína y un objetivo claro para enero.", ribbon: "Año Nuevo: 20% OFF para arrancar la versión 2027", couponCode: "VERSION2027", productSlugs: ["creatina-monohidrato", "ionic-whey", "l-carnitina", "multivitaminico", "electrolitos"] },
  { id: "san-valentin", name: "San Valentín", active: true, startsOn: "2027-02-01", endsOn: "2027-02-14", headline: "Entrenar de a dos", subtitle: "Para tu compañero o compañera de gym favorito: proteína para dos y un shaker de regalo.", ribbon: "San Valentín: 14% OFF de a dos", couponCode: "DUO14", productSlugs: ["ionic-whey", "shaker-volta", "barra-proteica", "mantequilla-mani", "proteina-vegana"] },
  { id: "vuelta-al-gym", name: "Vuelta al gym", active: true, startsOn: "2027-02-15", endsOn: "2027-03-15", headline: "Volvió la rutina", subtitle: "Después del verano, la barra te extraña. Arrancá con creatina, proteína y tiza nueva.", ribbon: "Vuelta al gym: 15% OFF para volver con todo", couponCode: "VUELTA15", productSlugs: ["creatina-monohidrato", "ionic-whey", "overvolt-pre", "magnesio-tiza", "shaker-volta"] },
  { id: "hot-sale", name: "Hot Sale", active: true, startsOn: "2027-05-10", endsOn: "2027-05-12", headline: "Tres días que queman", subtitle: "Los precios más bajos del año, solo por 72 horas.", ribbon: "Hot Sale: 30% OFF desde $30.000", couponCode: "HOTSALE30", productSlugs: ["isolate-zero", "ionic-whey", "mass-gainer", "creatina-brava", "termo-cut"] },
  { id: "dia-del-padre", name: "Día del Padre", active: true, startsOn: "2027-06-01", endsOn: "2027-06-20", headline: "Para el que no saltea piernas", subtitle: "Creatina, whey y shaker para papá, el abuelo y el tío. Pedilo hasta el 18 y llega para el domingo.", ribbon: "Día del Padre: 20% OFF para papá", couponCode: "PAPA20", productSlugs: ["creatina-monohidrato", "ionic-whey", "shaker-volta", "night-casein", "omega-3"] },
  { id: "dia-del-amigo", name: "Día del Amigo", active: true, startsOn: "2027-07-13", endsOn: "2027-07-20", headline: "Tu compañero de gym", subtitle: "El que te cuenta las repes y te banca la última. Regalale lo que más usa.", ribbon: "Día del Amigo: $5.000 OFF desde $35.000", couponCode: "COMPA5000", productSlugs: ["shaker-volta", "barra-proteica", "electrolitos", "bcaa-211", "gel-energetico"] },
  { id: "operacion-verano", name: "Operación verano", active: true, startsOn: "2027-09-01", endsOn: "2027-09-30", headline: "Modo verano: activado", subtitle: "Primavera en la costa: L-carnitina, termogénico, isolate e hidratación para llegar a enero.", ribbon: "Operación verano: 20% OFF todo septiembre", couponCode: "VERANO20", productSlugs: ["l-carnitina", "termo-cut", "isolate-zero", "electrolitos", "bcaa-211"] },
];

/** Un cupón por temática (se editan en Cupones y ruleta). */
export const themeCoupons: Coupon[] = [
  { code: "MAMA15", type: "PERCENT", value: 15, description: "15% por el Día de la Madre", active: true, usedCount: 9, themeId: "dia-de-la-madre" },
  { code: "MONSTER20", type: "PERCENT", value: 20, description: "20% de Halloween, modo monstruo", active: true, usedCount: 0, themeId: "halloween" },
  { code: "CYBER25", type: "PERCENT", value: 25, minSubtotal: 25000, description: "25% de CyberMonday desde $25.000", active: true, usedCount: 0, themeId: "cyber-monday" },
  { code: "BLACK30", type: "PERCENT", value: 30, minSubtotal: 40000, description: "30% de Black Friday desde $40.000", active: true, usedCount: 0, themeId: "black-friday" },
  { code: "NAVIDAD15", type: "PERCENT", value: 15, description: "15% de Navidad", active: true, usedCount: 0, themeId: "navidad" },
  { code: "VERSION2027", type: "PERCENT", value: 20, description: "20% para arrancar la versión 2027", active: true, usedCount: 0, themeId: "ano-nuevo" },
  { code: "DUO14", type: "PERCENT", value: 14, description: "14% de San Valentín, de a dos", active: true, usedCount: 0, themeId: "san-valentin" },
  { code: "VUELTA15", type: "PERCENT", value: 15, description: "15% para la vuelta al gym", active: true, usedCount: 0, themeId: "vuelta-al-gym" },
  { code: "HOTSALE30", type: "PERCENT", value: 30, minSubtotal: 30000, description: "30% de Hot Sale desde $30.000", active: true, usedCount: 0, themeId: "hot-sale" },
  { code: "PAPA20", type: "PERCENT", value: 20, description: "20% por el Día del Padre", active: true, usedCount: 0, themeId: "dia-del-padre" },
  { code: "COMPA5000", type: "FIXED", value: 5000, minSubtotal: 35000, description: "$5.000 por el Día del Amigo desde $35.000", active: true, usedCount: 0, themeId: "dia-del-amigo" },
  { code: "VERANO20", type: "PERCENT", value: 20, description: "20% de Operación verano", active: true, usedCount: 0, themeId: "operacion-verano" },
];

/** Fase 5: automática por fecha (en octubre sale el Día de la Madre) y con "Probar temáticas" para mostrar la demo. */
export const themeSettings: ThemeSettings = { mode: "auto", fixedId: "dia-de-la-madre", showTryButton: true };
