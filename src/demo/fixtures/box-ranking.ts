/**
 * Unidades vendidas de MUESTRA en la semana de la demo y en la anterior (tabla "El más elegido del box"). En
 * producción salen de los pedidos pagados de cada semana.
 */
export interface WeeklySales {
  productSlug: string;
  week: number;
  prevWeek: number;
}

export const weeklySales: WeeklySales[] = [
  { productSlug: "ionic-whey", week: 38, prevWeek: 34 },
  { productSlug: "creatina-monohidrato", week: 35, prevWeek: 37 },
  { productSlug: "overvolt-pre", week: 22, prevWeek: 15 },
  { productSlug: "barra-proteica", week: 19, prevWeek: 21 },
  { productSlug: "isolate-zero", week: 14, prevWeek: 9 },
  { productSlug: "electrolitos", week: 12, prevWeek: 12 },
  { productSlug: "creatina-gomitas", week: 9, prevWeek: 11 },
  { productSlug: "omega-3", week: 7, prevWeek: 8 },
];
