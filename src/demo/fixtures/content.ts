import { DISPATCH_PROMISE } from "../engine/lead-time";
import { brand } from "@/config/brand";
import type { StoreFaq } from "../types";
/** Textos de MUESTRA. En producción se editan desde el panel (Contenido) y requieren revisión legal. */
export interface LegalSection {
  title: string;
  paragraphs: string[];
}

/**
 * Preguntas de la ayuda del box (R2c), agrupadas por tema. Las 7 primeras son las de antes de v16 con el mismo texto
 * de pregunta (la migración las reconoce y no las duplica).
 */
export const storeFaqs: StoreFaq[] = [
  { topic: "suplementos", q: "¿Los productos son originales?", a: "Sí. Compramos directo a cada marca o a su distribuidor oficial. En los suplementos ves el lote y el vencimiento del envase que te llega." },
  { topic: "compras", q: "¿Qué marcas tienen?", a: "Trabajamos con varias marcas de suplementos y de equipamiento: straps, cinturones, rodilleras, guantes, vendas, sogas, bandas, shakers y bolsos. Si buscás una que no ves, escribinos y te la conseguimos." },
  { topic: "envios", q: "¿Cuándo me llega?", a: `En Mar del Plata, con cadete ${DISPATCH_PROMISE} (si ese día el reparto está completo, el próximo día hábil con lugar). Al resto del país, de 3 a 7 días hábiles. También podés retirar en el local.` },
  { topic: "pagos", q: "¿Cómo puedo pagar?", a: `Con Mercado Pago (tarjeta de crédito, débito o dinero en cuenta), por transferencia o con QR. Transferencia y QR tienen descuento y requieren subir el comprobante: ${brand.name} confirma el ingreso antes de despachar.` },
  { topic: "suplementos", q: "¿Cuál me conviene?", a: "Usá el filtro por objetivo, el comparador o el quiz de “Armá tu stack”, o escribinos por WhatsApp. Las recomendaciones de la tienda son orientativas: si tenés una condición de salud, consultá con tu médico o nutricionista." },
  { topic: "compras", q: "¿Necesito cuenta para comprar?", a: "No. Podés comprar como invitado. Con cuenta ves tus pedidos, sumás a las misiones del Club y te avisamos cuando se te está por terminar el pote." },
  { topic: "cambios", q: "¿Qué pasa si me arrepiento?", a: "Tenés el botón de arrepentimiento en el pie de la página: podés revocar la compra dentro de los 10 días corridos desde la entrega. Por higiene, los suplementos tienen que estar cerrados y con el precinto intacto; el equipamiento, sin uso y con su etiqueta." },
  { topic: "compras", q: "¿Qué es el descuento stack?", a: "Si en el carrito sumás productos de 3 categorías distintas de suplementos (por ejemplo proteína, creatina y pre-entreno), esas líneas tienen un descuento extra. El carrito y “Armá tu stack” te muestran cuánto ahorrás." },
  { topic: "compras", q: "¿Me avisan si baja un precio o si vuelve algo sin stock?", a: "Sí. En Mi rack tocá “Avisame si baja o si vuelve” en el producto que quieras. En esta demo el aviso es simulado: no se manda nada y lo ves en la misma pantalla." },
  { topic: "envios", q: "¿Puedo retirar en el local?", a: `Sí, sin cargo. Elegí el retiro en el local al finalizar la compra y pasá cuando te avisemos que está listo, en el horario de ${brand.name}.` },
  { topic: "envios", q: "¿Cómo sigo mi pedido?", a: "Con el link de seguimiento que te llega al confirmar la compra (o desde Mi cuenta). Ahí ves cada estado con su fecha y, cuando el local lo controla, el lote y el vencimiento de lo que te llevás." },
  { topic: "pagos", q: "¿Tienen cuotas?", a: "Con tarjeta de crédito por Mercado Pago, las que Mercado Pago ofrezca en su pantalla. El precio con transferencia o QR es el más bajo." },
  { topic: "pagos", q: "¿Por qué tengo que subir el comprobante de la transferencia?", a: `Porque ${brand.name} confirma el ingreso en la cuenta antes de despachar. Subir el comprobante no confirma el pago por sí solo: te avisamos cuando lo verificamos.` },
  { topic: "cambios", q: "¿Puedo cambiar el talle?", a: "Sí, dentro de los 10 días, sin uso y con la etiqueta. En Mar del Plata el cambio de talle no tiene costo: lo coordinamos por WhatsApp." },
  { topic: "cambios", q: "¿Qué hago si el producto llegó dañado?", a: "Escribinos por WhatsApp con el número de pedido y una foto del envase. Lo resolvemos con un cambio o la devolución del dinero." },
  { topic: "suplementos", q: "¿Dónde veo el lote y el vencimiento?", a: "En la ficha de cada suplemento, en la etiqueta de laboratorio. Con “Verificá tu lote” escribís el código del envase y ves su vencimiento, cuándo entró al local y el RNPA." },
  { topic: "suplementos", q: "¿Whey o isolate?", a: "El whey concentrado rinde más por peso; el isolate tiene más proteína por servicio y casi nada de lactosa. Si la lactosa te cae mal, isolate o vegana. Es orientativo: ante una duda de salud, consultá a un profesional." },
  { topic: "suplementos", q: "¿La creatina se toma todos los días?", a: "Sí: lo habitual son 3 a 5 g por día, entrenes o no, para mantener los depósitos llenos. No hace falta la fase de carga. Es orientativo: consultá a un profesional si tenés una condición de salud." },
  { topic: "equipamiento", q: "¿Qué onzas de guantes me convienen?", a: "10 oz para bolsa y clases; 12 oz si pesás más de 70 kg; 14 o 16 oz para sparring." },
  { topic: "equipamiento", q: "¿Cómo elijo el talle del cinturón?", a: "Medí la cintura a la altura del ombligo: S 65–80 cm, M 75–95 cm, L 90–110 cm y XL 105–125 cm. Si quedás entre dos, elegí el más grande." },
  { topic: "equipamiento", q: "¿El equipamiento tiene garantía?", a: "Sí, contra fallas de fabricación (costuras, abrojos y hebillas). Escribinos con una foto y lo revisamos." },
  { topic: "club", q: "¿Qué es el Club?", a: `Es el programa de ${brand.name}: sumás carga con tus compras y misiones, subís de nivel y desbloqueás beneficios. Entrás con tu cuenta, sin costo.` },
  { topic: "club", q: "¿Cómo canjeo un regalo?", a: "Abrí el link que te mandaron o entrá a “Tengo un regalo” con el código. Elegís cómo recibirlo y, si el regalo lo permite, el sabor o el talle." },
  { topic: "club", q: "¿Qué gano en Shaker Rush?", a: "Según tu puntaje, un cupón de descuento para tu próxima compra. Los premios y los puntajes los define el local." },
];

export const terms: LegalSection[] = [
  { title: "1. Alcance", paragraphs: [`Estos términos regulan las compras en la tienda online de ${brand.name}. Texto de muestra para la demo: la versión final requiere revisión de un abogado.`] },
  { title: "2. Suplementos dietarios", paragraphs: ["Los productos son suplementos dietarios registrados según el Código Alimentario Argentino. No son medicamentos ni reemplazan una alimentación variada. La información de la tienda es orientativa: ante cualquier duda o condición de salud, consultá con un profesional."] },
  { title: "3. Plazos de entrega", paragraphs: [`El plazo informado corre desde la confirmación del pago. Para transferencias y QR, el pago se confirma cuando ${brand.name} verifica el ingreso.`] },
  { title: "4. Precios y pagos", paragraphs: ["Los precios se informan en pesos argentinos, finales, junto con el precio sin impuestos nacionales. El total se recalcula al confirmar el pedido. Las cuotas, si existen, las ofrece Mercado Pago en su pantalla."] },
  { title: "5. Cambios y devoluciones", paragraphs: ["Por razones de higiene, los suplementos pueden cambiarse dentro de los 10 días corridos desde la entrega solo si están cerrados, con el precinto intacto y en su embalaje original. El equipamiento (straps, guantes, cinturones, rodilleras, etc.) se cambia dentro de los 10 días sin uso y con su etiqueta; el cambio de talle en Mar del Plata no tiene costo."] },
  { title: "6. Vencimientos", paragraphs: [`Cada ficha informa el lote y el vencimiento del envase disponible. ${brand.name} no despacha productos con menos de 3 meses de vida útil sin avisarte antes.`] },
];

export const privacy: LegalSection[] = [
  { title: "Qué datos pedimos", paragraphs: [`Nombre, email, teléfono y dirección de entrega para gestionar tu pedido. Los comprobantes se guardan de forma privada y solo los ve ${brand.name}.`] },
  { title: "Para qué los usamos", paragraphs: ["Para cobrar, entregar y avisarte el estado del pedido o cuándo se te termina un producto. No vendemos tus datos. Solo te enviamos promociones si lo aceptás."] },
  { title: "Tus derechos", paragraphs: ["Podés pedir acceso, rectificación o supresión de tus datos escribiéndonos. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales."] },
  { title: "En esta demo", paragraphs: ["La demo no envía datos a ningún servidor: todo queda en el almacenamiento local de tu navegador y se borra con “Reiniciar demo”."] },
];
