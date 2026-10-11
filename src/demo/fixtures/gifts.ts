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
    message: "¡Feliz día, ma! Para que Toto pasee con su nombre. Te quiero mucho.",
    occasion: "dia-de-la-madre",
    item: { slug: "collar-con-nombre", name: "Collar con nombre y dijes de patita", variant: "Talle M", detail: "Nombre: TOTO" },
    createdAt: "2026-10-02T15:30:00.000Z",
    eta: "2026-10-16",
  },
];

const SAMPLE_DAY = "2026-10-10T12:00:00.000Z";
const SAMPLE_ETA = "2026-10-23";

/**
 * Regalos de prueba, uno por ocasión (las 17 escenas de apertura): se abren escribiendo el código en /regalo/ desde
 * cualquier navegador, sin comprar antes. No van a ninguna cuenta (no tienen email). Personas y mensajes ficticios.
 * Lista con los links en docs/regalos-de-prueba.md.
 */
export const sampleGifts: Gift[] = [
  { code: "REGALO-VE1M-AR7X", occasion: "volta", from: "Caro", to: "Juli",
    message: "Porque sí, porque te quiero. Que tu casa huela a vos.",
    item: { slug: "difusor", name: "Difusor de varillas Volta", variant: "Algodón" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-MADR-E26B", occasion: "dia-de-la-madre", from: "Tomás", to: "Mamá",
    message: "Para la que nos cuida a todos. ¡Feliz día, ma!",
    item: { slug: "velador-con-foto", name: "Velador con foto", variant: "Mediano (20 cm)", detail: "Con una foto elegida para vos" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-C0NE-J0SC", occasion: "pascuas", from: "Abu Marta", to: "Benja",
    message: "¡Felices Pascuas! Este no se come, pero dura para siempre.",
    item: { slug: "salchicha-geometrico", name: "Perro salchicha geométrico", variant: "Único (25 cm)" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-NAV1-DADP", occasion: "navidad", from: "Los chicos", to: "Papá",
    message: "¡Feliz Navidad! Para que el living huela a fiesta todo el año.",
    item: { slug: "home-spray", name: "Home spray Volta", variant: "Maderas" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-HA11-0WEP", occasion: "halloween", from: "Mili", to: "Fran",
    message: "¿Truco o regalo? Regalo, obvio.",
    item: { slug: "vela-caniche", name: "Vela caniche", variant: "Lavanda" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PR1D-E26S", occasion: "orgullo", from: "Nico", to: "Santi",
    message: "Orgullo de vos, siempre. ¡Feliz marcha!",
    item: { slug: "figura-persona-y-perro", name: "Figura persona y perro", variant: "Hombre & perro" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-B1AC-KFRW", occasion: "black-friday", from: "Vale", to: "Vale",
    message: "Me lo regalé en Black Friday. Me lo merecía.",
    item: { slug: "comedero-elevado-madera", name: "Comedero elevado hueso", variant: "Nogal" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AN02-027S", occasion: "ano-nuevo", from: "Flor", to: "Mati",
    message: "Que el 2027 nos encuentre en la costa. ¡Feliz año!",
    item: { slug: "pieza-i-love-mdp", name: "Pieza “I ♥ MDP”", variant: "Único (15 cm)" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AM0R-014M", occasion: "san-valentin", from: "Lu", to: "Gonza",
    message: "Feliz San Valentín, amor. Vos, yo y Pancho.",
    item: { slug: "vela-souvenir-flores", name: "Vela souvenir con flores", variant: "Flores rosa" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PAT1-TAS9", occasion: "dia-del-animal", from: "Familia Pérez", to: "Rocco",
    message: "Feliz día, Rocco. Por todas las veces que nos esperaste en la puerta.",
    item: { slug: "comedero-perro-globo", name: "Comedero perro globo", variant: "Celeste · Mediano" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-H0TS-A1EX", occasion: "hot-sale", from: "Euge", to: "Pau",
    message: "Lo vi en el Hot Sale y pensé en vos.",
    item: { slug: "velador-pintado-a-mano", name: "Velador pintado a mano", variant: "Único (30 cm)", detail: "Pintado a mano desde una foto" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-MAY1-810M", occasion: "revolucion-de-mayo", from: "Tía Rosa", to: "Lauti",
    message: "¡Feliz 25! Con escarapela y chocolate caliente.",
    item: { slug: "vela-en-lata", name: "Vela en lata pintada", variant: "Celeste y blanca" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-PADR-E26D", occasion: "dia-del-padre", from: "Cami", to: "Papá",
    message: "Para el que saca a pasear a Pancho todas las mañanas. ¡Feliz día, pa!",
    item: { slug: "colgador-de-correa", name: "Colgador de correa con silueta", variant: "Madera natural" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-BAND-ERAE", occasion: "dia-de-la-bandera", from: "Joaco", to: "Abuelo",
    message: "Celeste y blanca, como el cielo de la costa.",
    item: { slug: "placa-nfc", name: "Placa NFC con tu imagen", variant: "Redonda 6 cm" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-1NDE-P168", occasion: "dia-de-la-independencia", from: "Sofi", to: "Martín",
    message: "¡Feliz 9 de Julio! Independientes, pero juntos.",
    item: { slug: "vela-caniche", name: "Vela caniche", variant: "Vainilla" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-AM1G-0S2S", occasion: "dia-del-amigo", from: "Pato", to: "Juanma",
    message: "Feliz día, amigo. Para Lola, de parte de su tío favorito.",
    item: { slug: "collar-con-nombre", name: "Collar con nombre y dijes de patita", variant: "Mediano (36–45 cm)", detail: "Nombre: LOLA" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
  { code: "REGALO-P1NA-TA14", occasion: "dia-del-nino", from: "Tío Leo", to: "Valen",
    message: "¡Feliz día, Valen! Para tu cuarto, con Lola.",
    item: { slug: "figura-persona-y-perro", name: "Figura persona y perro", variant: "Mujer & perro" }, createdAt: SAMPLE_DAY, eta: SAMPLE_ETA },
];
