import type { Product } from "../types";
import { collarTemplate, engravingTemplate, nameTemplate, photoPlateTemplate } from "./templates";

const madeToOrderFaq = { q: "¿Cuánto tarda?", a: "Se fabrica a pedido. El plazo corre desde que se confirma el pago." };

export const petProducts: Product[] = [
  {
    slug: "comedero-perro-globo", name: "Comedero perro globo", short: "Impreso en 3D, en el color que elijas",
    description: "Comedero con forma de perro globo, impreso en 3D con material apto para alimento seco. Elegí color, tamaño y sumá el nombre de tu mascota.",
    categorySlug: "comederos", basePrice: 18500, madeToOrderDays: 7, art: "bowl-dog", gallery: ["front", "detail", "context"],
    variants: [
      { id: "cpg-rosa-m", label: "Rosa · Mediano", color: "Rosa", colorHex: "#e88aa0", size: "Mediano", priceDelta: 0, stock: -1 },
      { id: "cpg-rosa-g", label: "Rosa · Grande", color: "Rosa", colorHex: "#e88aa0", size: "Grande", priceDelta: 4500, stock: -1 },
      { id: "cpg-celeste-m", label: "Celeste · Mediano", color: "Celeste", colorHex: "#8cbfe0", size: "Mediano", priceDelta: 0, stock: -1 },
      { id: "cpg-celeste-g", label: "Celeste · Grande", color: "Celeste", colorHex: "#8cbfe0", size: "Grande", priceDelta: 4500, stock: -1 },
      { id: "cpg-crema-m", label: "Crema · Mediano", color: "Crema", colorHex: "#f1e4c8", size: "Mediano", priceDelta: 0, stock: -1 },
      { id: "cpg-crema-g", label: "Crema · Grande", color: "Crema", colorHex: "#f1e4c8", size: "Grande", priceDelta: 4500, stock: -1 },
    ],
    personalization: nameTemplate,
    faqs: [madeToOrderFaq, { q: "¿Se puede lavar?", a: "Sí, a mano con agua tibia. No va al lavavajillas." }, { q: "¿Sirve para agua?", a: "Recomendado para alimento seco. Para agua consultanos el acabado sellado." }],
    featured: true, isNew: false, soldCount: 64, tags: ["perro", "plato", "3d"],
  },
  {
    slug: "comedero-elevado-madera", name: "Comedero elevado hueso", short: "Madera con forma de hueso y dos bowls de acero",
    description: "Comedero elevado de diseño: tabla de madera con forma de hueso y dos bowls de acero inoxidable. Altura pensada para perros medianos. Podés grabar el nombre en el frente.",
    categorySlug: "comederos", basePrice: 32000, art: "bowl-wood", gallery: ["front", "context"],
    variants: [
      { id: "cem-natural", label: "Natural", color: "Natural", colorHex: "#d8b98c", priceDelta: 0, stock: 12 },
      { id: "cem-nogal", label: "Nogal", color: "Nogal", colorHex: "#7a5434", priceDelta: 3000, stock: 0 },
    ],
    personalization: engravingTemplate,
    faqs: [{ q: "¿Viene armado?", a: "Sí, listo para usar." }, { q: "¿Los bowls se sacan?", a: "Sí, para lavarlos por separado." }],
    featured: true, isNew: false, soldCount: 22, tags: ["perro", "plato", "madera"],
  },
  {
    slug: "collar-con-nombre", name: "Collar con nombre y dijes de patita", short: "Paracord trenzado con letras 3D",
    description: "Collar de paracord trenzado a mano, con el nombre de tu mascota en letras impresas en 3D que cuelgan una al lado de la otra y dijes de patita. Armalo a tu gusto: letras sueltas o de corrido, color del cordón y de las letras, material, dije y talle según el cuello.",
    categorySlug: "collares", basePrice: 14900, madeToOrderDays: 5, art: "collar", gallery: ["front", "detail"],
    variants: [
      { id: "col-xs", label: "Mini (20–27 cm)", size: "Mini", priceDelta: 0, stock: -1 },
      { id: "col-s", label: "Chico (28–35 cm)", size: "Chico", priceDelta: 0, stock: -1 },
      { id: "col-m", label: "Mediano (36–45 cm)", size: "Mediano", priceDelta: 1500, stock: -1 },
      { id: "col-l", label: "Grande (46–55 cm)", size: "Grande", priceDelta: 2500, stock: -1 },
      { id: "col-xl", label: "Extra grande (56–65 cm)", size: "Extra grande", priceDelta: 3500, stock: -1 },
    ],
    personalization: collarTemplate,
    faqs: [madeToOrderFaq, { q: "¿Cómo mido el cuello?", a: "Con un centímetro, dejando dos dedos de holgura." }],
    featured: true, isNew: false, soldCount: 51, tags: ["perro", "gato", "nombre"],
  },
  {
    slug: "placa-nfc", name: "Placa NFC con tu imagen", short: "Subí cualquier imagen y elegí a dónde lleva",
    description: "Placa impresa con la imagen que quieras (tu logo, una foto o un ícono) y chip NFC: al acercar el celular abre el link que elijas, como tu Instagram, WhatsApp, menú o reseñas. Ideal para mostradores, ferias y regalos.",
    categorySlug: "placas-nfc", basePrice: 13500, madeToOrderDays: 4, art: "nfc-plate", gallery: ["front", "detail", "context"],
    variants: [
      { id: "pnfc-cuad-6", label: "Cuadrada 6 cm", size: "Cuadrada 6 cm", priceDelta: 0, stock: 12 },
      { id: "pnfc-red-6", label: "Redonda 6 cm", size: "Redonda 6 cm", priceDelta: 0, stock: 7 },
      { id: "pnfc-cuad-9", label: "Cuadrada 9 cm", size: "Cuadrada 9 cm", priceDelta: 3500, stock: 5 },
    ],
    personalization: photoPlateTemplate,
    faqs: [{ q: "¿Necesita batería?", a: "No. El chip NFC se activa con el celular." }, { q: "¿Puedo cambiar el link?", a: "Sí, se reprograma desde el celular las veces que quieras." }, { q: "¿Funciona con iPhone?", a: "Sí, con modelos que leen NFC (iPhone XS en adelante) y la mayoría de los Android." }],
    featured: true, isNew: true, soldCount: 38, tags: ["nfc", "placa", "negocio", "instagram", "regalo"],
  },
  {
    slug: "placa-nfc-instagram", name: "Placa NFC “Seguinos en Instagram”", short: "Lista para el mostrador",
    description: "Placa con ícono de cámara y chip NFC programado con tu perfil: tus clientes acercan el celular y te siguen en un toque. Viene lista para apoyar o pegar.",
    categorySlug: "placas-nfc", basePrice: 11900, art: "nfc-social", gallery: ["front", "detail"],
    variants: [
      { id: "pnig-blanca", label: "Blanca", color: "Blanca", colorHex: "#f7f3ea", priceDelta: 0, stock: 9 },
      { id: "pnig-oliva", label: "Verde oliva", color: "Verde oliva", colorHex: "#c5ccb3", priceDelta: 0, stock: 6 },
      { id: "pnig-madera", label: "Madera", color: "Madera", colorHex: "#d8b98c", priceDelta: 1500, stock: 0 },
    ],
    faqs: [{ q: "¿Me la dejan programada?", a: "Sí, con el link que nos pases al comprar. Después la podés cambiar vos." }],
    featured: false, isNew: false, soldCount: 19, tags: ["nfc", "placa", "negocio", "instagram"],
  },
];
