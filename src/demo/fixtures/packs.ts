import type { Pack } from "../types";
import { HOUSE_SHAKER_SLUG } from "./house";

/**
 * Packs de MUESTRA (L3): productos que se llevan juntos para un objetivo o un deporte. Los suplementos se repiten cada
 * mes si la persona se suscribe; el equipamiento (straps, botella, bolso…) viaja solo en la primera entrega. Los
 * descuentos son de muestra y se editan en el panel → Packs.
 */
export const packs: Pack[] = [
  {
    id: "hipertrofia", name: "Pack Hipertrofia", focus: "Masa muscular", featured: true, discountPct: 10, monthlyPct: 5,
    tagline: "Proteína, creatina y calorías para crecer",
    description: "Lo que necesitás para sumar masa: una whey para llegar a tu proteína, creatina para fuerza y un ganador de peso para los días que no llegás con la comida. Los straps vienen en la primera entrega.",
    items: [{ productSlug: "ionic-whey", qty: 1 }, { productSlug: "creatina-monohidrato", qty: 1 }, { productSlug: "mass-gainer", qty: 1 }, { productSlug: "straps-algodon", qty: 1 }],
  },
  {
    id: "fuerza", name: "Pack Fuerza", focus: "Fuerza", featured: true, discountPct: 10, monthlyPct: 5,
    tagline: "Creatina, pre-entreno y agarre para mover más kilos",
    description: "Creatina para las series pesadas, un pre-entreno para llegar con foco y una proteína aislada para después. En la primera entrega, magnesio en bloque y muñequeras para agarrar y sostener.",
    items: [{ productSlug: "creatina-monohidrato", qty: 1 }, { productSlug: "overvolt-pre", qty: 1 }, { productSlug: "isolate-zero", qty: 1 }, { productSlug: "magnesio-tiza", qty: 1 }, { productSlug: "munequeras-abrojo", qty: 1 }],
  },
  {
    id: "definicion", name: "Pack Definición", focus: "Definición", featured: false, discountPct: 10, monthlyPct: 5,
    tagline: "Proteína aislada y apoyo para tu plan de corte",
    description: "Una proteína aislada sin azúcar, L-carnitina y un termogénico para acompañar tu plan. En la primera entrega, un kit de bandas para entrenar donde quieras.",
    items: [{ productSlug: "isolate-zero", qty: 1 }, { productSlug: "l-carnitina", qty: 1 }, { productSlug: "termo-cut", qty: 1 }, { productSlug: "bandas-elasticas", qty: 1 }],
  },
  {
    id: "running", name: "Pack Running", focus: "Running", featured: false, discountPct: 10, monthlyPct: 5,
    tagline: "Hidratación y energía para tus kilómetros",
    description: "Geles con cafeína para los tramos largos, electrolitos para hidratarte bien y magnesio para recuperar. La botella deportiva va en la primera entrega.",
    items: [{ productSlug: "gel-energetico", qty: 1 }, { productSlug: "electrolitos", qty: 1 }, { productSlug: "magnesio-bisglicinato", qty: 1 }, { productSlug: "botella-1l", qty: 1 }],
  },
  {
    id: "futbol", name: "Pack Fútbol", focus: "Fútbol", featured: true, discountPct: 10, monthlyPct: 5,
    tagline: "Recuperación y energía para jugar toda la semana",
    description: "Electrolitos para los partidos, proteína para recuperar y magnesio para descansar. El bolso y la botella llegan en la primera entrega.",
    items: [{ productSlug: "electrolitos", qty: 1 }, { productSlug: "ionic-whey", qty: 1 }, { productSlug: "magnesio-bisglicinato", qty: 1 }, { productSlug: "bolso-40l", qty: 1 }, { productSlug: "botella-1l", qty: 1 }],
  },
  {
    id: "padel-tenis", name: "Pack Pádel y tenis", focus: "Pádel y tenis", featured: false, discountPct: 10, monthlyPct: 5,
    tagline: "Resistencia y recuperación para partidos largos",
    description: "Geles y electrolitos para sostener el ritmo en el tercer set, BCAA para recuperar y una botella deportiva para la cancha (primera entrega).",
    items: [{ productSlug: "gel-energetico", qty: 1 }, { productSlug: "electrolitos", qty: 1 }, { productSlug: "bcaa-211", qty: 1 }, { productSlug: "botella-1l", qty: 1 }],
  },
  {
    id: "boxeo", name: "Pack Boxeo", focus: "Boxeo y combate", featured: false, discountPct: 10, monthlyPct: 5,
    tagline: "Energía y resistencia para la bolsa y el sparring",
    description: "Un pre-entreno sin estimulantes para entrenar de noche, electrolitos para los rounds y creatina para la potencia. Vendas y soga llegan en la primera entrega.",
    items: [{ productSlug: "pump-flow", qty: 1 }, { productSlug: "electrolitos", qty: 1 }, { productSlug: "creatina-monohidrato", qty: 1 }, { productSlug: "vendas-boxeo", qty: 1 }, { productSlug: "soga-rulemanes", qty: 1 }],
  },
  {
    id: "salud", name: "Pack Salud", focus: "Salud y bienestar", featured: false, discountPct: 10, monthlyPct: 5,
    tagline: "La base para sentirte bien todos los días",
    description: "Multivitamínico, omega 3, magnesio y colágeno: lo básico para cuidar articulaciones, descanso y defensas, sin pensar qué te falta cada mes.",
    items: [{ productSlug: "multivitaminico", qty: 1 }, { productSlug: "omega-3", qty: 1 }, { productSlug: "magnesio-bisglicinato", qty: 1 }, { productSlug: "colageno", qty: 1 }],
  },
  {
    id: "principiante", name: "Pack Principiante", focus: "Para empezar", featured: true, discountPct: 10, monthlyPct: 5,
    tagline: "Lo justo para arrancar sin gastar de más",
    description: "Una proteína, creatina y el shaker para prepararlos: lo único que necesitás para empezar a entrenar. El shaker viene en la primera entrega.",
    items: [{ productSlug: "ionic-whey", qty: 1 }, { productSlug: "creatina-monohidrato", qty: 1 }, { productSlug: HOUSE_SHAKER_SLUG, qty: 1 }],
  },
];
