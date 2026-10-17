import { DISPATCH_PROMISE } from "../engine/lead-time";
import { brand } from "@/config/brand";
/** Textos de MUESTRA. En producción se editan desde el panel (Contenido) y requieren revisión legal. */
export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const storeFaqs = [
  { q: "¿Los productos son originales?", a: "Sí. Compramos directo a cada marca o a su distribuidor oficial. En los suplementos ves el lote y el vencimiento del envase que te llega." },
  { q: "¿Qué marcas tienen?", a: "Trabajamos con varias marcas de suplementos y de equipamiento: straps, cinturones, rodilleras, guantes, vendas, sogas, bandas, shakers y bolsos. Si buscás una que no ves, escribinos y te la conseguimos." },
  { q: "¿Cuándo me llega?", a: `En Mar del Plata, con cadete ${DISPATCH_PROMISE} (si ese día el reparto está completo, el próximo día hábil con lugar). Al resto del país, de 3 a 7 días hábiles. También podés retirar en el local.` },
  { q: "¿Cómo puedo pagar?", a: `Con Mercado Pago (tarjeta de crédito, débito o dinero en cuenta), por transferencia o con QR. Transferencia y QR tienen descuento y requieren subir el comprobante: ${brand.name} confirma el ingreso antes de despachar.` },
  { q: "¿Cuál me conviene?", a: "Usá el filtro por objetivo o escribinos por WhatsApp. Las recomendaciones de la tienda son orientativas: si tenés una condición de salud, consultá con tu médico o nutricionista." },
  { q: "¿Necesito cuenta para comprar?", a: "No. Podés comprar como invitado. Con cuenta ves tus pedidos, sumás a las misiones del Club y te avisamos cuando se te está por terminar el pote." },
  { q: "¿Qué pasa si me arrepiento?", a: "Tenés el botón de arrepentimiento en el pie de la página. Por higiene, los suplementos tienen que estar cerrados y con el precinto intacto; el equipamiento, sin uso y con su etiqueta." },
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
