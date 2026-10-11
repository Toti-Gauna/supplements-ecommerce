import type { Gift } from "../engine/gifts";

/**
 * Regalo de muestra que espera sin abrir en la cuenta demo (Sofía), para mostrar la apertura sin comprar antes.
 * Personas y mensaje ficticios.
 */
export const demoGifts: Gift[] = [
  {
    code: "REGALO-P3XE-1KCP",
    from: "Lucía",
    to: "Sofía",
    toEmail: "sofia.demo@ejemplo.com",
    message: "¡Feliz día, ma! Para tus mañanas de pilates. Te quiero mucho.",
    occasion: "dia-de-la-madre",
    item: { slug: "colageno", name: "Colágeno hidrolizado + vitamina C", variant: "Frutos rojos" },
    createdAt: "2026-10-02T15:30:00.000Z",
    eta: "2026-10-16",
  },
];

const SAMPLE_DAY = "2026-10-10T12:00:00.000Z";
const SAMPLE_ETA = "2026-10-23";

/**
 * Regalos de prueba, uno por ocasión (las escenas de apertura): se abren escribiendo el código en /regalo/ desde
 * cualquier navegador, sin comprar antes. No van a ninguna cuenta (no tienen email). Personas y mensajes ficticios.
 * Lista con los links en docs/regalos-de-prueba.md.
 */
export const sampleGifts: Gift[] = [
  { code: "REGALO-VE1M-AR7X", occasion: "volta", from: "Caro", to: "Juli",
    message: "Porque sí. Para que arranques la semana con todo.",
    item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "Chocolate · 2 lb (907 g)" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-MADR-E26B", occasion: "dia-de-la-madre", from: "Tomás", to: "Mamá",
    message: "Para la que corre más que todos nosotros. ¡Feliz día, ma!",
    item: { slug: "omega-3", name: "Omega 3 1000 mg", variant: "120 cápsulas" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-C0NE-J0SC", occasion: "pascuas", from: "Abu Marta", to: "Benja",
    message: "¡Felices Pascuas! Este huevo viene con proteína.",
    item: { slug: "alfajor-proteico", name: "Alfajor proteico", variant: "Dulce de leche · Caja x 6" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-NAV1-DADP", occasion: "navidad", from: "Los chicos", to: "Papá",
    message: "¡Feliz Navidad, pa! Para que el 2027 te encuentre más fuerte que nunca.",
    item: { slug: "creatina-monohidrato", name: "Creatina monohidrato micronizada", variant: "Sin sabor · 500 g" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-HA11-0WEP", occasion: "halloween", from: "Mili", to: "Fran",
    message: "¿Truco o regalo? Pre-entreno, obvio.",
    item: { slug: "overvolt-pre", name: "Overvolt pre-entreno", variant: "Frutos rojos" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PR1D-E26S", occasion: "orgullo", from: "Nico", to: "Santi",
    message: "Orgullo de vos, siempre. ¡Feliz marcha!",
    item: { slug: "electrolitos", name: "Electro Volt sobres", variant: "Blue razz" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-B1AC-KFRW", occasion: "black-friday", from: "Vale", to: "Vale",
    message: "Me lo regalé en Black Friday. Me lo merecía.",
    item: { slug: "isolate-zero", name: "Isolate Zero", variant: "Chocolate" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AN02-027S", occasion: "ano-nuevo", from: "Flor", to: "Mati",
    message: "Año nuevo, marca nueva. ¡A romperla en 2027!",
    item: { slug: "shaker-volta", name: "Shaker VOLTA 700 ml", variant: "Voltio" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AM0R-014M", occasion: "san-valentin", from: "Lu", to: "Gonza",
    message: "Feliz San Valentín, amor. Vos, yo y el gym a las 7.",
    item: { slug: "barra-proteica", name: "Barra proteica 20 g", variant: "Chocolate · Caja x 12" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PAT1-TAS9", occasion: "dia-del-animal", from: "Familia Pérez", to: "Rocco",
    message: "Feliz día, Rocco. Para tus salidas a correr con nosotros.",
    item: { slug: "gel-energetico", name: "Gel energético con cafeína", variant: "Tropical" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-H0TS-A1EX", occasion: "hot-sale", from: "Euge", to: "Pau",
    message: "Lo vi en el Hot Sale y pensé en vos.",
    item: { slug: "mass-gainer", name: "Mass Gainer 3 kg", variant: "Dulce de leche" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-MAY1-810M", occasion: "revolucion-de-mayo", from: "Tía Rosa", to: "Lauti",
    message: "¡Feliz 25! Con escarapela y un batido de chocolate.",
    item: { slug: "night-casein", name: "Night Casein", variant: "Chocolate" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PADR-E26D", occasion: "dia-del-padre", from: "Cami", to: "Papá",
    message: "Para el que levanta más que yo. ¡Feliz día, pa!",
    item: { slug: "creatina-gomitas", name: "Creatina en gomitas", variant: "Naranja" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-BAND-ERAE", occasion: "dia-de-la-bandera", from: "Joaco", to: "Abuelo",
    message: "Celeste y blanca, como el cielo de la costa.",
    item: { slug: "magnesio-bisglicinato", name: "Magnesio bisglicinato", variant: "60 cápsulas" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-1NDE-P168", occasion: "dia-de-la-independencia", from: "Sofi", to: "Martín",
    message: "¡Feliz 9 de Julio! Independientes, pero entrenamos juntos.",
    item: { slug: "bcaa-211", name: "BCAA 2:1:1", variant: "Limón" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AM1G-0S2S", occasion: "dia-del-amigo", from: "Pato", to: "Juanma",
    message: "Feliz día, compañero de gym. Te debo el spot de la banca.",
    item: { slug: "pump-flow", name: "Pump Flow sin estimulantes", variant: "Sandía" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-P1NA-TA14", occasion: "dia-del-nino", from: "Tío Leo", to: "Valen",
    message: "¡Feliz día, Valen! Para tus partidos del sábado.",
    item: { slug: "electrolitos", name: "Electro Volt sobres", variant: "Naranja" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
];
