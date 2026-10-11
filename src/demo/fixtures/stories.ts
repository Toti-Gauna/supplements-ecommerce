/**
 * "Productos que cuentan historias" del inicio. Historias ILUSTRATIVAS escritas para la demo:
 * no son clientes reales. Reemplazar por historias aprobadas por Volta (con permiso de cada cliente).
 */
export interface ProductStory {
  id: string;
  productSlug: string;
  kicker: string;
  title: string;
  text: string;
}

export const productStories: ProductStory[] = [
  { id: "st1", productSlug: "velador-con-foto", kicker: "Con tu foto", title: "La foto del primer viaje, ahora es luz", text: "Una foto de vacaciones encuadrada en el velador del living. La vista previa se aprobó antes de fabricarla." },
  { id: "st2", productSlug: "comedero-perro-globo", kicker: "Con nombre", title: "Un comedero en el verde de la cocina", text: "Elegido en el color de la casa y con el nombre de la mascota en letra manuscrita." },
  { id: "st3", productSlug: "placa-nfc", kicker: "Tecnología NFC", title: "Un toque y ya te siguen", text: "Una cafetería puso su logo en la placa: los clientes acercan el celular al mostrador y abren su Instagram. Sin apps ni baterías." },
  { id: "st4", productSlug: "velador-pintado-a-mano", kicker: "Pintado a mano", title: "Un retrato pintado desde una foto", text: "Se envía una foto de referencia y notas; el taller la interpreta a mano, pieza única." },
];
