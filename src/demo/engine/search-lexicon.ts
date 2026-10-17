import type { Goal, ProductBadge } from "../types";

/**
 * Vocabulario del rubro para la búsqueda: palabras vacías, sellos, objetivos y sinónimos. Todo en minúscula y sin
 * tildes; los plurales se resuelven solos (ver `stem`). Los sabores salen del catálogo (variantes), no de acá.
 */

/** Palabras que no aportan a la búsqueda. "sin" solo cuenta cuando arma un sello ("sin tacc") o un sabor ("sin sabor"). */
export const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "lo", "un", "una", "unos", "unas", "y", "e", "o", "u", "a", "al", "en", "por", "para",
  "con", "que", "algo", "alguno", "alguna", "quiero", "queria", "busco", "buscando", "necesito", "me", "mi", "mis", "te", "tu",
  "se", "mas", "muy", "tipo", "bueno", "buena", "mejor", "producto", "suplemento", "sin", "hay", "tenes", "tienen", "es", "sea",
]);

/** Etiqueta de cada sello (la misma que muestra la ficha). */
export const BADGE_LABELS: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "Sin azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "Sin cafeína",
};

/** Frases que se entienden como sello del rótulo (filtro). */
export const BADGE_PHRASES: Record<ProductBadge, string[]> = {
  "sin-tacc": ["sin tacc", "sin gluten", "libre de gluten", "gluten free", "apto celiaco", "celiaco", "tacc"],
  vegano: ["vegano", "vegana", "vegetal", "plant based", "apto vegano"],
  "sin-azucar": ["sin azucar", "cero azucar", "0 azucar", "zero azucar", "sugar free", "sin azucares agregado"],
  keto: ["keto", "cetogenica", "cetogenico", "low carb"],
  "marca-propia": ["marca propia"],
  "sin-cafeina": ["sin cafeina", "sin estimulante", "descafeinado", "stim free", "0 cafeina", "cero cafeina"],
};

/** Frases que se entienden como objetivo de entrenamiento (filtro). */
export const GOAL_PHRASES: Record<Goal, string[]> = {
  "masa-muscular": ["masa muscular", "masa", "ganar masa", "ganar musculo", "musculo", "hipertrofia", "volumen", "ganar peso", "crecer", "aumentar masa"],
  fuerza: ["fuerza", "potencia", "fuerte"],
  energia: ["energia", "energetico", "energizante", "foco", "cansancio"],
  recuperacion: ["recuperacion", "recuperar", "recuperarme", "descanso", "dormir", "dolor muscular"],
  definicion: ["definicion", "definir", "definirme", "bajar de peso", "bajar peso", "adelgazar", "quemar grasa", "perder grasa", "cutting"],
  resistencia: ["resistencia", "running", "correr", "maraton", "ciclismo", "cardio", "aerobico", "trail"],
  salud: ["salud", "bienestar", "defensas", "inmunidad"],
};

/**
 * Sinónimos del rubro. Cada entrada se dispara con cualquiera de sus frases y busca su término y sus alternativas.
 * Las alternativas puntúan un poco menos que la palabra escrita.
 */
export interface Synonym {
  term: string;
  phrases: string[];
  alts: string[];
}

export const SYNONYMS: Synonym[] = [
  { term: "whey", phrases: ["whey", "proteina de suero", "suero de leche", "suero"], alts: ["suero"] },
  { term: "proteina", phrases: ["proteina", "protein", "prote"], alts: [] },
  { term: "isolate", phrases: ["isolate", "aislada", "aislado", "whey isolate"], alts: ["aislada", "aislado"] },
  { term: "pre", phrases: ["pre", "pre entreno", "preentreno", "pre entrenamiento", "pre workout", "preworkout"], alts: ["preentreno"] },
  { term: "creatina", phrases: ["creatina", "creatine", "monohidrato"], alts: ["monohidrato"] },
  { term: "bcaa", phrases: ["bcaa", "aminoacido", "amino", "leucina"], alts: ["aminoacido", "glutamina"] },
  { term: "gomita", phrases: ["gomita", "gummies", "gummy", "goma"], alts: ["gummie"] },
  { term: "barra", phrases: ["barra", "barrita", "barra de proteina"], alts: [] },
  { term: "colageno", phrases: ["colageno", "collagen"], alts: [] },
  { term: "quemador", phrases: ["quemador", "quemagrasa", "fat burner", "termogenico", "quemador de grasa"], alts: ["termogenico", "carnitina", "definicion"] },
  { term: "caseina", phrases: ["caseina", "casein"], alts: [] },
  { term: "ganador", phrases: ["ganador", "gainer", "ganador de peso"], alts: ["gainer"] },
  { term: "omega", phrases: ["omega", "omega 3", "aceite de pescado", "dha", "epa"], alts: ["dha", "epa"] },
  { term: "vitamina", phrases: ["vitamina", "multivitaminico", "multi"], alts: ["multivitaminico"] },
  { term: "electrolito", phrases: ["electrolito", "sales", "isotonica", "hidratante"], alts: ["hidratacion"] },
  { term: "mantequilla", phrases: ["mantequilla", "pasta de mani", "peanut butter"], alts: [] },
  { term: "tiza", phrases: ["tiza", "chalk", "magnesio para agarre"], alts: ["agarre"] },
  { term: "shaker", phrases: ["shaker", "vaso mezclador", "coctelera", "mezclador"], alts: ["vaso"] },
  // Equipamiento (L2: tienda deportiva multimarca).
  { term: "straps", phrases: ["straps", "strap", "correas", "correa de agarre", "cintas de agarre", "lifting straps"], alts: ["agarre"] },
  { term: "cinturon", phrases: ["cinturon", "faja", "cinto", "belt", "cinturon de levantamiento"], alts: ["faja"] },
  { term: "rodilleras", phrases: ["rodillera", "rodilleras", "knee sleeves", "rodilla"], alts: ["neoprene"] },
  { term: "munequeras", phrases: ["munequera", "munequeras", "wrist wraps", "muneca"], alts: [] },
  { term: "guantes", phrases: ["guante", "guantes", "guantes de boxeo", "gloves", "guantines"], alts: ["boxeo"] },
  { term: "vendas", phrases: ["venda", "vendas", "vendas de boxeo", "hand wraps", "vendaje"], alts: ["boxeo"] },
  { term: "soga", phrases: ["soga", "cuerda", "jump rope", "soga de saltar", "comba"], alts: ["saltar"] },
  { term: "bandas", phrases: ["banda", "bandas", "elastico", "elasticos", "ligas", "theraband", "mini bands"], alts: ["elasticas"] },
  { term: "botella", phrases: ["botella", "botellita", "bidon", "caramanola", "termo de agua"], alts: ["agua"] },
  { term: "bolso", phrases: ["bolso", "mochila", "bolsa de gym", "gym bag", "duffle"], alts: ["mochila"] },
];

/** Otras formas de escribir un sabor del catálogo (el sabor se escribe como en la variante, normalizado). */
export const FLAVOR_ALIASES: Record<string, string[]> = {
  chocolate: ["choco", "chocolatada"],
  frutilla: ["fresa", "strawberry"],
  vainilla: ["vainila", "vanilla"],
  "dulce de leche": ["ddl"],
  "cookies cream": ["cookies and cream", "cookies n cream", "cookies"],
  "frutos rojos": ["berries", "frutos del bosque"],
};
