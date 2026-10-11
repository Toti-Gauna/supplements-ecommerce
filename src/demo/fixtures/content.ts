/** Textos de MUESTRA. En producción se editan desde el panel (Contenido) y requieren revisión legal. */
export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const storeFaqs = [
  { q: "¿Cómo funciona la vista previa?", a: "Elegís el producto, cargás texto o foto y ves cómo queda. Solo lo agregás al carrito cuando marcás “Así lo quiero”. Eso es exactamente lo que recibe el taller." },
  { q: "¿Cuánto tarda un pedido personalizado?", a: "Cada producto muestra su plazo de fabricación. Corre desde que se confirma el pago." },
  { q: "¿Cómo puedo pagar?", a: "Con Mercado Pago (tarjeta de crédito, débito o dinero en cuenta), por transferencia o con QR. Transferencia y QR tienen descuento y requieren subir el comprobante: Volta confirma el ingreso antes de empezar." },
  { q: "¿Hacen envíos?", a: "Sí: cadete en Mar del Plata, envío al resto del país o retiro en persona." },
  { q: "¿Necesito cuenta para comprar?", a: "No. Podés comprar como invitado. Con cuenta ves tus pedidos y sumás a las misiones para ganar premios." },
  { q: "¿Qué pasa si me arrepiento?", a: "Tenés el botón de arrepentimiento en el pie de la página. Los productos hechos a medida pueden estar exceptuados; lo revisamos caso por caso." },
];

export const terms: LegalSection[] = [
  { title: "1. Alcance", paragraphs: ["Estos términos regulan las compras en la tienda online de Volta. Texto de muestra para la demo: la versión final requiere revisión de un abogado."] },
  { title: "2. Productos personalizados", paragraphs: ["Los productos confeccionados según las especificaciones del comprador (texto, foto o referencia aprobada en la vista previa) pueden estar exceptuados del derecho de arrepentimiento (art. 1116 del Código Civil y Comercial). La vista previa es ilustrativa: respeta texto, colores y encuadre aprobados; pueden existir variaciones propias del material."] },
  { title: "3. Plazos de fabricación", paragraphs: ["El plazo informado en cada producto corre desde la confirmación del pago. Para transferencias y QR, el pago se confirma cuando Volta verifica el ingreso."] },
  { title: "4. Precios y pagos", paragraphs: ["Los precios se informan en pesos argentinos, finales, junto con el precio sin impuestos nacionales. El total se recalcula al confirmar el pedido. Las cuotas, si existen, las ofrece Mercado Pago en su pantalla."] },
  { title: "5. Cambios y devoluciones", paragraphs: ["Los productos no personalizados pueden cambiarse dentro de los 10 días corridos desde la entrega, sin uso y en su embalaje."] },
  { title: "6. Contenido de terceros", paragraphs: ["Cuando el comprador solicita diseños con marcas, personajes o escudos de terceros, la responsabilidad por su uso corresponde al vendedor según su contrato y la normativa vigente."] },
];

export const privacy: LegalSection[] = [
  { title: "Qué datos pedimos", paragraphs: ["Nombre, email, teléfono y dirección de entrega para gestionar tu pedido. Las fotos de personalización y los comprobantes se guardan de forma privada y solo los ve Volta."] },
  { title: "Para qué los usamos", paragraphs: ["Para fabricar, cobrar, entregar y avisarte el estado del pedido. No vendemos tus datos. Solo te enviamos promociones si lo aceptás."] },
  { title: "Tus derechos", paragraphs: ["Podés pedir acceso, rectificación o supresión de tus datos escribiéndonos. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales."] },
  { title: "En esta demo", paragraphs: ["La demo no envía datos a ningún servidor: todo queda en el almacenamiento local de tu navegador y se borra con “Reiniciar demo”. Las fotos se procesan solo en tu dispositivo."] },
];
