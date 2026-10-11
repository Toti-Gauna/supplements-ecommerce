import type { Coupon, SeasonalTheme, ThemeSettings } from "../types";

/**
 * Temáticas de MUESTRA para las fechas comerciales de Argentina (pedido de Ignacio, fuera de la especificación).
 * Fechas aproximadas para 2026-2027; se repiten cada año y se ajustan desde el panel.
 * Fase 5: Orgullo reemplaza a San Patricio y se suman las fechas patrias (25 de Mayo, 20 de Junio y 9 de Julio).
 * El Día del Padre termina el 17 de junio para dejar el fin de semana largo a la bandera y dar tiempo al taller.
 */
export const seasonalThemes: SeasonalTheme[] = [
  { id: "dia-de-la-madre", name: "Día de la Madre", active: true, startsOn: "2026-10-01", endsOn: "2026-10-18", headline: "Para la que nos cuida a todos", subtitle: "Regalos hechos a mano, con nombre o con la foto de la familia.", ribbon: "Día de la Madre: 15% OFF en regalos", couponCode: "MAMA15", productSlugs: ["ionic-whey", "creatina-monohidrato", "overvolt-pre", "colageno", "omega-3"] },
  { id: "halloween", name: "Halloween", active: true, startsOn: "2026-10-19", endsOn: "2026-10-31", headline: "Truco o regalo", subtitle: "Ofertas de miedo para tu casa y tu mascota, solo hasta el 31.", ribbon: "Halloween: 20% OFF con código", couponCode: "BOO20", productSlugs: ["overvolt-pre", "mass-gainer", "creatina-gomitas", "barra-proteica", "shaker-volta"] },
  { id: "orgullo", name: "Orgullo", active: true, startsOn: "2026-11-01", endsOn: "2026-11-07", headline: "Orgullo de ser quien sos", subtitle: "Marcha del Orgullo en Buenos Aires: sábado 7 de noviembre. Regalos con todos los colores.", ribbon: "Orgullo: 15% OFF con todos los colores", couponCode: "ORGULLO15", productSlugs: ["electrolitos", "isolate-zero", "bcaa-211", "colageno", "pump-flow"] },
  { id: "black-friday", name: "Black Friday", active: true, startsOn: "2026-11-23", endsOn: "2026-11-30", headline: "Black Friday Volta", subtitle: "La semana con los mejores precios del año en todo el taller.", ribbon: "Black Friday: 25% OFF desde $30.000", couponCode: "BLACK25", productSlugs: ["isolate-zero", "ionic-whey", "mass-gainer", "creatina-monohidrato", "overvolt-pre"] },
  { id: "navidad", name: "Navidad", active: true, startsOn: "2026-12-01", endsOn: "2026-12-25", headline: "Regalos con nombre para el árbol", subtitle: "Encargalo antes del 18 y llega para Nochebuena.", ribbon: "Navidad: 15% OFF y envoltorio de regalo", couponCode: "NAVIDAD15", productSlugs: ["creatina-monohidrato", "shaker-volta", "alfajor-proteico", "ionic-whey", "multivitaminico"] },
  { id: "ano-nuevo", name: "Año Nuevo", active: true, startsOn: "2026-12-26", endsOn: "2027-01-06", headline: "Brindemos por un año con alma", subtitle: "Arrancá el año renovando tu casa y los rincones de tu mascota.", ribbon: "Año Nuevo: 10% OFF para empezar", couponCode: "BRINDIS10", productSlugs: ["ionic-whey", "creatina-monohidrato", "l-carnitina", "termo-cut", "electrolitos"] },
  { id: "san-valentin", name: "San Valentín", active: true, startsOn: "2027-02-01", endsOn: "2027-02-14", headline: "Amor de cuatro patas", subtitle: "Para tu persona favorita (y para tu mascota favorita).", ribbon: "San Valentín: 14% OFF con amor", couponCode: "AMOR14", productSlugs: ["ionic-whey", "creatina-monohidrato", "overvolt-pre", "colageno", "omega-3"] },
  { id: "pascuas", name: "Pascuas", active: true, startsOn: "2027-03-18", endsOn: "2027-03-28", headline: "Encontrá el huevo de Pascua", subtitle: "Sorpresas para regalar en familia, con nombre o con foto.", ribbon: "Pascuas: 12% OFF escondido acá", couponCode: "PASCUAS12", productSlugs: ["overvolt-pre", "mass-gainer", "creatina-gomitas", "barra-proteica", "shaker-volta"] },
  { id: "dia-del-animal", name: "Día del Animal", active: true, startsOn: "2027-04-20", endsOn: "2027-04-29", headline: "Su día, sus cosas", subtitle: "El 29 de abril festejamos a los que nos esperan en la puerta.", ribbon: "Día del Animal: 20% OFF en mascotas", couponCode: "PATITAS20", productSlugs: ["electrolitos", "isolate-zero", "bcaa-211", "colageno", "pump-flow"] },
  { id: "hot-sale", name: "Hot Sale", active: true, startsOn: "2027-05-10", endsOn: "2027-05-12", headline: "Hot Sale: tres días que queman", subtitle: "Los precios más bajos del taller, solo por 72 horas.", ribbon: "Hot Sale: 30% OFF desde $30.000", couponCode: "HOTSALE30", productSlugs: ["isolate-zero", "ionic-whey", "mass-gainer", "creatina-monohidrato", "overvolt-pre"] },
  { id: "revolucion-de-mayo", name: "25 de Mayo", active: true, startsOn: "2027-05-18", endsOn: "2027-05-25", headline: "Con escarapela y empanadas", subtitle: "Celebramos la Revolución de Mayo con regalos hechos acá, en Mar del Plata.", ribbon: "25 de Mayo: $2.500 OFF desde $25.000", couponCode: "MAYO25", productSlugs: ["creatina-monohidrato", "shaker-volta", "alfajor-proteico", "ionic-whey", "multivitaminico"] },
  { id: "dia-del-padre", name: "Día del Padre", active: true, startsOn: "2027-06-01", endsOn: "2027-06-17", headline: "Para el que saca a pasear al perro", subtitle: "Regalos con estilo para papá, para el abuelo y para el tío. Encargalo hasta el 17 y llega para el domingo.", ribbon: "Día del Padre: 15% OFF para papá", couponCode: "PAPA15", productSlugs: ["ionic-whey", "creatina-monohidrato", "l-carnitina", "termo-cut", "electrolitos"] },
  { id: "dia-de-la-bandera", name: "Día de la Bandera", active: true, startsOn: "2027-06-18", endsOn: "2027-06-20", headline: "Celeste y blanca, como el cielo de la costa", subtitle: "El 20 de junio homenajeamos a Belgrano con piezas en celeste y blanco.", ribbon: "Día de la Bandera: 20% OFF desde $20.000", couponCode: "BANDERA20", productSlugs: ["ionic-whey", "creatina-monohidrato", "overvolt-pre", "colageno", "omega-3"] },
  { id: "dia-de-la-independencia", name: "9 de Julio", active: true, startsOn: "2027-07-03", endsOn: "2027-07-09", headline: "Independientes desde 1816", subtitle: "Festejamos el Día de la Independencia con un 9% en todo el taller.", ribbon: "9 de Julio: 9% OFF en todo", couponCode: "JULIO9", productSlugs: ["overvolt-pre", "mass-gainer", "creatina-gomitas", "barra-proteica", "shaker-volta"] },
  { id: "dia-del-amigo", name: "Día del Amigo", active: true, startsOn: "2027-07-13", endsOn: "2027-07-20", headline: "Un mate, un amigo, un regalo", subtitle: "El 20 de julio regalá algo con su nombre (o el de su perro).", ribbon: "Día del Amigo: $3.000 OFF desde $25.000", couponCode: "AMIGOS3000", productSlugs: ["electrolitos", "isolate-zero", "bcaa-211", "colageno", "pump-flow"] },
  { id: "dia-del-nino", name: "Día del Niño", active: true, startsOn: "2027-08-02", endsOn: "2027-08-15", headline: "Para los más chicos de la casa", subtitle: "Colores, nombres y mascotas: regalos que se juegan.", ribbon: "Día del Niño: 10% OFF para jugar", couponCode: "PEQUES10", productSlugs: ["isolate-zero", "ionic-whey", "mass-gainer", "creatina-monohidrato", "overvolt-pre"] },
];

/** Un cupón por temática (se editan en Cupones y ruleta). */
export const themeCoupons: Coupon[] = [
  { code: "MAMA15", type: "PERCENT", value: 15, description: "15% por el Día de la Madre", active: true, usedCount: 9, themeId: "dia-de-la-madre" },
  { code: "BOO20", type: "PERCENT", value: 20, description: "20% de Halloween", active: true, usedCount: 0, themeId: "halloween" },
  { code: "ORGULLO15", type: "PERCENT", value: 15, description: "15% por el Orgullo", active: true, usedCount: 0, themeId: "orgullo" },
  { code: "BLACK25", type: "PERCENT", value: 25, minSubtotal: 30000, description: "25% de Black Friday desde $30.000", active: true, usedCount: 0, themeId: "black-friday" },
  { code: "NAVIDAD15", type: "PERCENT", value: 15, description: "15% de Navidad", active: true, usedCount: 0, themeId: "navidad" },
  { code: "BRINDIS10", type: "PERCENT", value: 10, description: "10% para empezar el año", active: true, usedCount: 0, themeId: "ano-nuevo" },
  { code: "AMOR14", type: "PERCENT", value: 14, description: "14% de San Valentín", active: true, usedCount: 0, themeId: "san-valentin" },
  { code: "PASCUAS12", type: "PERCENT", value: 12, description: "12% de Pascuas", active: true, usedCount: 0, themeId: "pascuas" },
  { code: "PATITAS20", type: "PERCENT", value: 20, description: "20% por el Día del Animal", active: true, usedCount: 0, themeId: "dia-del-animal" },
  { code: "HOTSALE30", type: "PERCENT", value: 30, minSubtotal: 30000, description: "30% de Hot Sale desde $30.000", active: true, usedCount: 0, themeId: "hot-sale" },
  { code: "MAYO25", type: "FIXED", value: 2500, minSubtotal: 25000, description: "$2.500 por el 25 de Mayo desde $25.000", active: true, usedCount: 0, themeId: "revolucion-de-mayo" },
  { code: "PAPA15", type: "PERCENT", value: 15, description: "15% por el Día del Padre", active: true, usedCount: 0, themeId: "dia-del-padre" },
  { code: "BANDERA20", type: "PERCENT", value: 20, minSubtotal: 20000, description: "20% por el Día de la Bandera desde $20.000", active: true, usedCount: 0, themeId: "dia-de-la-bandera" },
  { code: "JULIO9", type: "PERCENT", value: 9, description: "9% por el 9 de Julio", active: true, usedCount: 0, themeId: "dia-de-la-independencia" },
  { code: "AMIGOS3000", type: "FIXED", value: 3000, minSubtotal: 25000, description: "$3.000 por el Día del Amigo desde $25.000", active: true, usedCount: 0, themeId: "dia-del-amigo" },
  { code: "PEQUES10", type: "PERCENT", value: 10, description: "10% por el Día del Niño", active: true, usedCount: 0, themeId: "dia-del-nino" },
];

// Fase 0-4: sin temática hasta que la Fase 5 rehaga las temáticas fitness (docs/plan-por-fases.md).
export const themeSettings: ThemeSettings = { mode: "off", fixedId: "halloween", showTryButton: false };
