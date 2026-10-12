import { isOccasion, type Gift } from "../engine/gifts";

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

/** Un regalo de prueba antes de saber si su ocasión existe (las temáticas se editan aparte). */
type SampleGift = Omit<Gift, "occasion"> & { occasion: string };

const samples: SampleGift[] = [
  { code: "REGALO-VE1M-AR7X", occasion: "volta", from: "Caro", to: "Juli",
    message: "Porque sí. Para que arranques la semana con todo.",
    item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "Chocolate · 2 lb (907 g)" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-MADR-E26B", occasion: "dia-de-la-madre", from: "Tomás", to: "Mamá",
    message: "Para la que corre más que todos nosotros. ¡Feliz día, ma!",
    item: { slug: "omega-3", name: "Omega 3 1000 mg", variant: "120 cápsulas" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-HA11-0WEP", occasion: "halloween", from: "Mili", to: "Fran",
    message: "¿Truco o regalo? Pre-entreno, obvio.",
    item: { slug: "overvolt-pre", name: "Overvolt pre-entreno", variant: "Frutos rojos" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-CYB3-R725", occasion: "cyber-monday", from: "Agus", to: "Leo",
    message: "Lo cacé en el CyberMonday antes de que volara. Estrenala.",
    item: { slug: "creatina-brava", name: "Creatina Brava 100% pura", variant: "Sin sabor" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-B1AC-KFRW", occasion: "black-friday", from: "Vale", to: "Vale",
    message: "Me lo regalé en Black Friday. Me lo merecía.",
    item: { slug: "isolate-zero", name: "Isolate Zero", variant: "Chocolate" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-NAV1-DADP", occasion: "navidad", from: "Sofi y Benja", to: "Papá",
    message: "¡Feliz Navidad, pa! Para que el 2027 te encuentre más fuerte que nunca.",
    item: { slug: "creatina-monohidrato", name: "Creatina monohidrato micronizada", variant: "Sin sabor · 500 g" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AN02-027S", occasion: "ano-nuevo", from: "Flor", to: "Mati",
    message: "Año nuevo, marca nueva. ¡A romperla en 2027!",
    item: { slug: "shaker-volta", name: "Shaker VOLTA 700 ml", variant: "Voltio" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AM0R-014M", occasion: "san-valentin", from: "Lu", to: "Gonza",
    message: "Feliz San Valentín, amor. Vos, yo y el gym a las 7.",
    item: { slug: "barra-proteica", name: "Barra proteica 20 g", variant: "Chocolate · Caja x 12" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-GYM0-D1AN", occasion: "vuelta-al-gym", from: "Ro", to: "Nacho",
    message: "Se terminó el verano: el lunes volvemos. Te espero en la banca.",
    item: { slug: "proteina-vegana", name: "Proteína vegana arveja + arroz", variant: "Chocolate" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-H0TS-A1EX", occasion: "hot-sale", from: "Euge", to: "Pau",
    message: "Lo vi en el Hot Sale y pensé en vos.",
    item: { slug: "mass-gainer", name: "Mass Gainer 3 kg", variant: "Dulce de leche" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PADR-E26D", occasion: "dia-del-padre", from: "Cami", to: "Papá",
    message: "Para el que levanta más que yo. ¡Feliz día, pa!",
    item: { slug: "creatina-gomitas", name: "Creatina en gomitas", variant: "Naranja" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AM1G-0S2S", occasion: "dia-del-amigo", from: "Pato", to: "Juanma",
    message: "Feliz día, compañero de gym. Te debo el spot de la banca.",
    item: { slug: "pump-flow", name: "Pump Flow sin estimulantes", variant: "Sandía" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-VERA-N0SZ", occasion: "operacion-verano", from: "Juli", to: "Caro",
    message: "Operación verano: arrancamos hoy. Hidratada y sin excusas.",
    item: { slug: "electrolitos", name: "Electro Volt sobres", variant: "Blue razz" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
];

/**
 * Regalos de prueba, uno por ocasión (las variantes de la bolsa de boxeo): se abren escribiendo el código en /regalo/
 * desde cualquier navegador, sin comprar antes. No van a ninguna cuenta (no tienen email). Personas y mensajes
 * ficticios. Solo quedan los de ocasiones que existen: si una temática se agrega o se quita, la lista la sigue.
 */
export const sampleGifts: Gift[] = samples.flatMap(({ occasion, ...g }) => (isOccasion(occasion) ? [{ ...g, occasion }] : []));
