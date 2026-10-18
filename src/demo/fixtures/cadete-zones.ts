/**
 * Recorrido del cadete en Mar del Plata (R4b, hoja de ruta): zonas en el orden en que las recorre, con su franja
 * horaria y las calles que caen en cada una. Una dirección se ubica por su calle; si no coincide con ninguna, va al
 * final ("Otras zonas"). De MUESTRA: en la tienda real las zonas y franjas las carga el dueño.
 */
export interface CadeteZone {
  id: string;
  name: string;
  /** Franja en la que el cadete pasa por la zona. */
  window: string;
  /** Calles (en minúscula y sin tildes) que caen en la zona. */
  streets: string[];
}

export const CADETE_ZONES: CadeteZone[] = [
  { id: "centro", name: "Centro", window: "10 a 12 h", streets: ["colon", "rivadavia", "luro", "san martin", "independencia", "belgrano", "mitre", "entre rios"] },
  { id: "playa-grande", name: "Playa Grande y Los Troncos", window: "12 a 14 h", streets: ["alem", "guemes", "brown", "almafuerte", "aristobulo del valle"] },
  { id: "sur", name: "Chauvín y San José", window: "15 a 17 h", streets: ["jara", "funes", "juan b. justo", "edison", "dorrego"] },
];

export const OTHER_ZONE: CadeteZone = { id: "otras", name: "Otras zonas", window: "17 a 19 h", streets: [] };
