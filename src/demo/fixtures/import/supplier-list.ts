import type { Cell } from "../../admin/import/cells";

/**
 * Lista de precios de MUESTRA de un distribuidor ficticio ("Distribuidora Atlántica"), como llega por WhatsApp o
 * mail: membrete arriba, columnas con sus propios nombres, montos con $ y puntos, filas sin sabor (valen para todos),
 * productos que la tienda no vende, una presentación que no existe y un costo con centavos. Todo inventado.
 */
export const SUPPLIER_NAME = "Distribuidora Atlántica (ficticia)";

export const SUPPLIER_SHEET: Cell[][] = [
  ["DISTRIBUIDORA ATLÁNTICA · Lista de precios octubre 2026"],
  ["Datos de muestra para la demo · Precios en pesos, IVA incluido"],
  [],
  ["Marca", "Cód. prov.", "Artículo", "Presentación", "Sabor", "Costo", "PVP sugerido"],
  ["Brava Sport", "BS-110", "Night Casein", "2 lb", "", "$ 41.200", "$ 69.900"],
  ["Brava Sport", "BS-120", "Creatina Brava 100% pura", "250 g", "", "$ 16.900", "$ 28.500"],
  ["Brava Sport", "BS-131", "Pump Flow sin estimulantes", "300 g", "Uva", "$ 23.900", "$ 35.900"],
  ["Brava Sport", "BS-132", "Pump Flow sin estimulantes", "300 g", "Sandía", "$ 23.900", "$ 35.900"],
  ["Brava Sport", "BS-140", "Alfajor proteico", "Caja x 6", "", "$ 9.900", "$ 16.900"],
  ["Brava Sport", "BS-141", "Alfajor proteico", "Caja x 12", "", "$ 18.300", "$ 31.500"],
  ["Brava Sport", "BS-150", "Barra Brava Crunch", "Unidad", "Chocolate", "$ 1.300", "$ 2.500"],
  ["Krono Nutrition", "KR-210", "Isolate Zero", "2 lb", "", "$ 45.300", "$ 75.900"],
  ["Krono Nutrition", "KR-220", "BCAA 2:1:1", "300 g", "", 17200, 29500],
  ["Krono Nutrition", "KR-230", "L-Carnitina líquida 3000", "500 ml", "", "$ 13.900", "$ 22.900"],
  ["Krono Nutrition", "KR-240", "Colágeno hidrolizado + vitamina C", "300 g", "", "$ 14.900", "$ 24.900"],
  ["Krono Nutrition", "KR-250", "Krono Mass 5 kg", "5 kg", "Chocolate", "$ 62.000", "$ 99.900"],
  ["Forja", "FJ-310", "Overvolt pre-entreno", "300 g", "", "$ 22.900", "$ 38.900"],
  ["Forja", "FJ-320", "Mass Gainer 3 kg", "3 kg", "", "$ 36.900", "$ 61.900"],
  ["Forja", "FJ-330", "Termo Cut termogénico", "90 cápsulas", "", "$ 16.100", "$ 26.900"],
  ["Forja", "FJ-340", "Gel energético con cafeína", "Caja x 6", "", "$ 7.400", "$ 12.500"],
  ["Forja", "FJ-341", "Gel energético con cafeína", "Caja x 24", "", "$ 27.900", "$ 46.900"],
  ["Forja", "FJ-350", "Shaker Forja 600 ml", "Unidad", "Negro", "$ 12.990,50", "$ 19.900"],
];

/** Segunda hoja: otra marca que manda costo y margen sugerido en vez de precio. */
export const SUPPLIER_MARGIN_SHEET: Cell[][] = [
  ["Marca", "Producto", "Presentación", "Costo", "Margen %"],
  ["Ozono", "Proteína vegana arveja + arroz", "1 kg", "$ 29.800", "40 %"],
  ["Ozono", "Omega 3 1000 mg", "60 cápsulas", "$ 11.500", "40 %"],
  ["Ozono", "Omega 3 1000 mg", "120 cápsulas", "$ 18.900", "40 %"],
  ["Ozono", "Magnesio bisglicinato", "60 cápsulas", "$ 10.800", "40 %"],
  ["Ozono", "Mantequilla de maní 100%", "500 g", "$ 6.100", "38 %"],
  ["Ozono", "Mantequilla de maní 100%", "1 kg", "$ 10.400", "38 %"],
];

export const SUPPLIER_SHEETS = [
  { name: "Lista octubre", rows: SUPPLIER_SHEET },
  { name: "Ozono · con margen", rows: SUPPLIER_MARGIN_SHEET },
];
