/**
 * Liga de gimnasios de Mar del Plata (R2c): boxes y gimnasios INVENTADOS para la demo (cualquier parecido con uno real
 * es casualidad). Los puntos del mes son de MUESTRA y no incluyen los de la cuenta demo, que se suman aparte. En
 * producción salen de los pedidos pagados, las misiones y Shaker Rush de los socios de cada box.
 */
export type GymKind = "box" | "boxeo" | "gimnasio" | "powerlifting";

export interface Gym {
  id: string;
  name: string;
  barrio: string;
  kind: GymKind;
  /** Clientes de la tienda que lo eligieron (muestra). */
  members: number;
  /** Puntos del mes en curso, sin la cuenta demo. */
  monthPoints: number;
}

export const GYM_KIND_LABEL: Record<GymKind, string> = { box: "Box de funcional", boxeo: "Boxeo", gimnasio: "Gimnasio", powerlifting: "Powerlifting" };

export const GYMS: Gym[] = [
  { id: "fragua", name: "Fragua Box", barrio: "Güemes", kind: "box", members: 112, monthPoints: 4120 },
  { id: "puerto-fight", name: "Puerto Fight Club", barrio: "Puerto", kind: "boxeo", members: 96, monthPoints: 3890 },
  { id: "acantilado", name: "Acantilado Training", barrio: "Los Acantilados", kind: "box", members: 74, monthPoints: 3610 },
  { id: "hierro-norte", name: "Hierro Norte", barrio: "La Perla", kind: "powerlifting", members: 58, monthPoints: 3270 },
  { id: "rompeolas", name: "Sala Rompeolas", barrio: "Punta Mogotes", kind: "gimnasio", members: 88, monthPoints: 2980 },
  { id: "constitucion", name: "Box Constitución", barrio: "Constitución", kind: "box", members: 61, monthPoints: 2650 },
  { id: "faro", name: "Gimnasio del Faro", barrio: "Faro Norte", kind: "gimnasio", members: 47, monthPoints: 2310 },
  { id: "ring-chauvin", name: "Ring Chauvín", barrio: "Chauvín", kind: "boxeo", members: 39, monthPoints: 1940 },
];

/** Qué se lleva el box que termina primero en el mes (texto de muestra; lo define el dueño). */
export const LEAGUE_PRIZE = "El box que termina primero se lleva un 15 % para todos sus socios la primera semana del mes siguiente y un sorteo de un pack en el local.";
