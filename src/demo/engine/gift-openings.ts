import type { SeasonId } from "../types";

/** Escena de apertura: una por fecha (las 12 comerciales y los 5 días del deporte) y la bolsa de boxeo original. */
export type OpeningScene = SeasonId | "original";

type Pt = [number, number];

/**
 * Una apertura física: qué se hace, cuántas veces y cómo se cuenta. `focus` es el punto de cada gesto y `reveal`
 * dónde aparece el regalo, en el lienzo del escenario (800 × 1000): la cámara los sigue.
 */
export interface OpeningMeta {
  /** Nombre de la apertura ("Árbol de discos"): vista previa, Mis regalos y lector de pantalla. */
  name: string;
  /** Cómo se abre, para completar "Lo abre …" ("sacando los discos del árbol"). */
  line: string;
  /** El gesto, como orden ("Sacá un disco del árbol"): nombre del botón. */
  action: string;
  steps: number;
  /** Cómo se cuenta lo que falta: ["disco", "discos"]. */
  unit: [string, string];
  /** Rótulo del medidor ("Discos"). */
  meter: string;
  /** Lo que se le dice antes de cada gesto (el último es el del gesto final). */
  prompts: string[];
  /** Al terminar ("¡La rompiste!"). */
  done: string;
  /** Golpe (sacudón y destello) o mecanismo (un clic seco). */
  feel: "impact" | "mechanic";
  focus: Pt[];
  reveal: Pt;
}

const P = (...prompts: string[]) => prompts;

/** Registro de aperturas. Exhaustivo sobre `SeasonId`: una fecha nueva no compila sin la suya. */
export const OPENINGS: Record<OpeningScene, OpeningMeta> = {
  original: {
    name: "Bolsa de boxeo", line: "a golpes contra la bolsa de boxeo", action: "Golpeá la bolsa", steps: 5, unit: ["golpe", "golpes"], meter: "Golpes",
    prompts: P("¡Pegale a la bolsa!", "¡Otra vez!", "¡Más fuerte!", "¡Ya casi!", "¡El último, con todo!"), done: "¡La rompiste!", feel: "impact",
    focus: [[400, 510], [367, 453], [433, 551], [375, 567], [416, 477]], reveal: [400, 520],
  },
  "dia-de-la-madre": {
    name: "Colchoneta enrollada", line: "desenrollando la colchoneta", action: "Desenrollá la colchoneta", steps: 4, unit: ["vuelta", "vueltas"], meter: "Vueltas",
    prompts: P("Desenrollá la colchoneta", "Una vuelta más", "Ya se ve algo", "¡La última vuelta!"), done: "¡Lista para entrenar!", feel: "mechanic",
    focus: [[290, 715], [410, 725], [530, 735], [650, 760]], reveal: [640, 772],
  },
  halloween: {
    name: "Tablero de luces del box", line: "prendiendo las luces del box una por una", action: "Subí una palanca del tablero", steps: 4, unit: ["palanca", "palancas"], meter: "Luces",
    prompts: P("El box está a oscuras…", "Otra palanca", "Algo se mueve ahí", "¡Prendé todo!"), done: "¡Luces!", feel: "mechanic",
    focus: [[150, 470], [150, 470], [150, 470], [150, 470]], reveal: [520, 935],
  },
  "cyber-monday": {
    name: "Máquina de poleas", line: "tirando de la polea hasta cargar el 100 %", action: "Tirá de la polea", steps: 5, unit: ["tirón", "tirones"], meter: "Carga",
    prompts: P("Tirá de la polea", "20 % cargado", "40 %… seguí", "Overclock en camino", "¡Al 100 %!"), done: "¡Carga completa!", feel: "mechanic",
    focus: [[430, 518], [430, 482], [430, 446], [430, 410], [430, 374]], reveal: [430, 372],
  },
  "black-friday": {
    name: "Persiana del locker", line: "levantando la persiana del locker", action: "Levantá la persiana", steps: 4, unit: ["tirón", "tirones"], meter: "Persiana",
    prompts: P("Levantá la persiana", "Sube…", "Ya entra luz", "¡Arriba del todo!"), done: "¡Abierto!", feel: "mechanic",
    focus: [[400, 651], [400, 543], [400, 434], [400, 330]], reveal: [400, 760],
  },
  navidad: {
    name: "Árbol de discos", line: "sacando los discos del árbol", action: "Sacá un disco del árbol", steps: 5, unit: ["disco", "discos"], meter: "Discos",
    prompts: P("Sacá el primer disco", "Otro disco", "El árbol se aliviana", "Ya brilla algo", "¡El último disco!"), done: "¡Feliz Navidad!", feel: "mechanic",
    focus: [[400, 330], [400, 410], [400, 490], [400, 570], [400, 650]], reveal: [400, 742],
  },
  "ano-nuevo": {
    name: "Cronómetro del box", line: "con la cuenta regresiva del cronómetro del box", action: "Marcá un segundo", steps: 5, unit: ["segundo", "segundos"], meter: "Cuenta",
    prompts: P("Arrancá la cuenta", "4…", "3…", "2…", "¡1!"), done: "¡Versión 2027!", feel: "mechanic",
    focus: [[400, 330], [400, 330], [400, 330], [400, 330], [400, 330]], reveal: [400, 604],
  },
  "san-valentin": {
    name: "Pulsómetro de a dos", line: "subiéndole las pulsaciones al pulsómetro", action: "Subí las pulsaciones", steps: 4, unit: ["latido", "latidos"], meter: "Pulso",
    prompts: P("Tocá para que lata", "Se acelera…", "Zona roja", "¡A tope!"), done: "¡Pulso a tope!", feel: "impact",
    focus: [[400, 300], [400, 300], [400, 300], [400, 300]], reveal: [400, 638],
  },
  "vuelta-al-gym": {
    name: "Lona del verano", line: "sacando la lona que tapó el rack todo el verano", action: "Tirá de la lona", steps: 4, unit: ["tirón", "tirones"], meter: "Lona",
    prompts: P("Tirá de la lona", "Sale el polvo del verano", "Ya se ve el rack", "¡Afuera la lona!"), done: "¡Volvió la rutina!", feel: "mechanic",
    focus: [[317, 240], [445, 280], [572, 340], [640, 430]], reveal: [400, 628],
  },
  "hot-sale": {
    name: "Sogas de batalla", line: "a ondas de soga hasta que levante temperatura", action: "Hacé una onda con las sogas", steps: 5, unit: ["onda", "ondas"], meter: "Calor",
    prompts: P("¡Agitá las sogas!", "Calienta…", "Más rápido", "Se prende fuego", "¡La última, que explota!"), done: "¡Tres días que queman!", feel: "impact",
    focus: [[360, 560], [440, 600], [520, 640], [600, 680], [680, 720]], reveal: [470, 935],
  },
  "dia-del-padre": {
    name: "Cubierta de tractor", line: "dando vuelta la cubierta de tractor", action: "Empujá la cubierta", steps: 4, unit: ["empujón", "empujones"], meter: "Fuerza",
    prompts: P("Agarrá la cubierta", "¡Arriba!", "Ya está parada", "¡Dala vuelta!"), done: "¡Cubierta dada vuelta!", feel: "impact",
    focus: [[400, 600], [400, 520], [400, 450], [400, 400]], reveal: [400, 772],
  },
  "dia-del-amigo": {
    name: "El spot del compañero", line: "levantando la barra con la ayuda de su compañero de gym", action: "Empujá la barra", steps: 4, unit: ["repetición", "repeticiones"], meter: "Repes",
    prompts: P("¡Arriba, te cuido!", "Una más, vamos", "Sube, sube…", "¡La última, te ayudo!"), done: "¡Barra al rack!", feel: "impact",
    focus: [[400, 560], [400, 525], [400, 490], [400, 452]], reveal: [400, 308],
  },
  "operacion-verano": {
    name: "Bolsa de arena", line: "estampando la bolsa de arena contra el piso", action: "Estampá la bolsa de arena", steps: 4, unit: ["golpe", "golpes"], meter: "Golpes",
    prompts: P("¡Arriba la bolsa!", "¡Contra el piso!", "Ya se abre la costura", "¡El último, con todo!"), done: "¡Modo verano!", feel: "impact",
    focus: [[400, 700], [380, 705], [420, 700], [400, 700]], reveal: [400, 772],
  },
  "crossfit-open": {
    name: "Wall ball al blanco", line: "tirando wall balls al blanco", action: "Tirá la pelota al blanco", steps: 5, unit: ["tiro", "tiros"], meter: "Tiros",
    prompts: P("¡Al blanco!", "Uno más", "Mitad del WOD", "Respirá y tirá", "¡El último del WOD!"), done: "¡WOD terminado!", feel: "impact",
    focus: [[400, 300], [380, 290], [420, 310], [395, 305], [400, 300]], reveal: [400, 372],
  },
  "dia-actividad-fisica": {
    name: "Soga y bolso", line: "saltando la soga hasta abrir el bolso", action: "Saltá la soga", steps: 5, unit: ["salto", "saltos"], meter: "Saltos",
    prompts: P("¡A saltar!", "Dos", "Tres, seguí", "Cuatro…", "¡El último salto!"), done: "¡A moverse!", feel: "mechanic",
    focus: [[250, 520], [250, 520], [250, 520], [250, 520], [250, 520]], reveal: [600, 590],
  },
  "dia-del-futbolista": {
    name: "Tablero de puntería", line: "pateando al arco hasta tirar el tablero", action: "Pateá al arco", steps: 4, unit: ["tiro", "tiros"], meter: "Tiros",
    prompts: P("¡Pateá al ángulo!", "¡Al otro palo!", "Abajo, cruzado", "¡El último, al medio!"), done: "¡Golazo!", feel: "impact",
    focus: [[215, 365], [585, 365], [215, 555], [400, 460]], reveal: [400, 652],
  },
  "dia-del-running": {
    name: "Cinta de llegada", line: "corriendo hasta cortar la cinta de llegada", action: "Dá una zancada", steps: 5, unit: ["zancada", "zancadas"], meter: "Metros",
    prompts: P("¡Largaste!", "Buen ritmo", "Mitad de carrera", "Ya se ve la meta", "¡A la cinta!"), done: "¡Llegaste!", feel: "mechanic",
    focus: [[400, 483], [400, 499], [400, 516], [400, 532], [400, 548]], reveal: [600, 770],
  },
  "dia-del-boxeador": {
    name: "Manoplas del rincón", line: "pegándole a las manoplas del entrenador", action: "Pegale a la manopla", steps: 5, unit: ["golpe", "golpes"], meter: "Golpes",
    prompts: P("¡Jab!", "¡Cross!", "¡Gancho!", "Uno-dos…", "¡El último, con todo!"), done: "¡Ganaste el round!", feel: "impact",
    focus: [[288, 430], [452, 430], [288, 430], [452, 430], [452, 430]], reveal: [606, 694],
  },
};

/** El locker (la otra mecánica, con combinación): mismo escenario, la cámara va al candado y después adentro. */
export const LOCKER: OpeningMeta = {
  name: "Locker con combinación", line: "con la combinación del locker", action: "Marcá la combinación", steps: 1, unit: ["número", "números"], meter: "Combinación",
  prompts: P("Marcá la combinación"), done: "¡Abierto!", feel: "mechanic", focus: [[478, 486]], reveal: [400, 660],
};
