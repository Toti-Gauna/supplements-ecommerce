/**
 * Lista de costos de MUESTRA de un distribuidor ficticio ("Mayorista del Puerto"), como la mandan por mail o WhatsApp
 * y se pega en el panel: membrete, columnas propias y montos con $ y puntos. Casi todo subió respecto del mes pasado,
 * tres filas bajaron y dos no coinciden con lo que la tienda vende (un producto que no tiene y una presentación que
 * no existe). Todo inventado.
 */
export const SUPPLIER_PASTE_NAME = "Mayorista del Puerto (ficticio)";

const HEADER = ["Marca", "Cód.", "Artículo", "Presentación", "Sabor", "Costo"];

const ROWS: string[][] = [
  ["Krono Nutrition", "KR-110", "Isolate Zero", "2 lb", "Chocolate", "$ 45.000"],
  ["Krono Nutrition", "KR-120", "Isolate Zero", "2 lb", "Vainilla", "$ 45.500"],
  ["Ozono", "OZ-130", "Proteína vegana arveja + arroz", "1 kg", "Chocolate", "$ 30.900"],
  ["Ozono", "OZ-140", "Proteína vegana arveja + arroz", "1 kg", "Natural", "$ 31.200"],
  ["Brava Sport", "BS-150", "Night Casein", "2 lb", "Chocolate", "$ 41.800"],
  ["Brava Sport", "BS-160", "Night Casein", "2 lb", "Vainilla", "$ 42.200"],
  ["Forja", "FJ-170", "Mass Gainer 3 kg", "3 kg", "Chocolate", "$ 36.500"],
  ["Forja", "FJ-180", "Mass Gainer 3 kg", "3 kg", "Banana", "$ 36.900"],
  ["Forja", "FJ-190", "Mass Gainer 3 kg", "3 kg", "Dulce de leche", "$ 37.200"],
  ["Brava Sport", "BS-200", "Creatina Brava 100% pura", "250 g", "Sin sabor", "$ 15.100"],
  ["Forja", "FJ-210", "Overvolt pre-entreno", "300 g", "Frutos rojos", "$ 23.800"],
  ["Forja", "FJ-220", "Overvolt pre-entreno", "300 g", "Limón", "$ 24.000"],
  ["Forja", "FJ-230", "Overvolt pre-entreno", "300 g", "Mango", "$ 22.900"],
  ["Brava Sport", "BS-240", "Pump Flow sin estimulantes", "300 g", "Uva", "$ 23.800"],
  ["Brava Sport", "BS-250", "Pump Flow sin estimulantes", "300 g", "Sandía", "$ 24.100"],
  ["Krono Nutrition", "KR-260", "BCAA 2:1:1", "300 g", "Limón", "$ 16.200"],
  ["Krono Nutrition", "KR-270", "BCAA 2:1:1", "300 g", "Uva", "$ 16.200"],
  ["Krono Nutrition", "KR-280", "L-Carnitina líquida 3000", "500 ml", "Limón", "$ 14.200"],
  ["Krono Nutrition", "KR-290", "L-Carnitina líquida 3000", "500 ml", "Ananá", "$ 13.600"],
  ["Forja", "FJ-300", "Termo Cut termogénico", "90 cápsulas", "", "$ 16.200"],
  ["Ozono", "OZ-310", "Omega 3 1000 mg", "60 cápsulas", "", "$ 11.900"],
  ["Ozono", "OZ-320", "Omega 3 1000 mg", "120 cápsulas", "", "$ 19.700"],
  ["Ozono", "OZ-330", "Magnesio bisglicinato", "60 cápsulas", "", "$ 11.300"],
  ["Krono Nutrition", "KR-340", "Colágeno hidrolizado + vitamina C", "300 g", "Limón", "$ 15.500"],
  ["Krono Nutrition", "KR-350", "Colágeno hidrolizado + vitamina C", "300 g", "Frutos rojos", "$ 14.800"],
  ["Krono Nutrition", "KR-360", "Colágeno hidrolizado + vitamina C", "300 g", "Natural", "$ 14.900"],
  ["Brava Sport", "BS-370", "Alfajor proteico", "Caja x 6", "Dulce de leche", "$ 10.000"],
  ["Brava Sport", "BS-380", "Alfajor proteico", "Caja x 12", "Dulce de leche", "$ 19.000"],
  ["Brava Sport", "BS-390", "Alfajor proteico", "Caja x 6", "Chocolate blanco", "$ 10.200"],
  ["Brava Sport", "BS-400", "Alfajor proteico", "Caja x 12", "Chocolate blanco", "$ 19.300"],
  ["Ozono", "OZ-410", "Mantequilla de maní 100%", "500 g", "Natural", "$ 6.100"],
  ["Ozono", "OZ-420", "Mantequilla de maní 100%", "1 kg", "Natural", "$ 10.800"],
  ["Ozono", "OZ-430", "Mantequilla de maní 100%", "500 g", "Crunchy", "$ 6.200"],
  ["Ozono", "OZ-440", "Mantequilla de maní 100%", "1 kg", "Crunchy", "$ 11.000"],
  ["Forja", "FJ-450", "Gel energético con cafeína", "Caja x 6", "Frutos rojos", "$ 7.400"],
  ["Forja", "FJ-460", "Gel energético con cafeína", "Caja x 6", "Tropical", "$ 7.400"],
  ["Hierro", "HI-470", "Straps de levantamiento", "", "", "$ 8.500"],
  ["Hierro", "HI-480", "Cinturón de palanca 10 mm", "S", "", "$ 43.100"],
  ["Hierro", "HI-490", "Cinturón de palanca 10 mm", "M", "", "$ 43.500"],
  ["Hierro", "HI-500", "Cinturón de palanca 10 mm", "L", "", "$ 43.900"],
  ["Hierro", "HI-510", "Cinturón de palanca 10 mm", "XL", "", "$ 45.500"],
  ["Hierro", "HI-520", "Rodilleras de neoprene 7 mm", "S", "", "$ 25.600"],
  ["Hierro", "HI-530", "Rodilleras de neoprene 7 mm", "M", "", "$ 24.400"],
  ["Hierro", "HI-540", "Rodilleras de neoprene 7 mm", "L", "", "$ 24.700"],
  ["Hierro", "HI-550", "Rodilleras de neoprene 7 mm", "XL", "", "$ 26.100"],
  ["Hierro", "HI-560", "Muñequeras con abrojo", "", "", "$ 9.900"],
  ["Doce Rounds", "DR-570", "Vendas de boxeo 4,5 m", "", "", "$ 5.800"],
  ["Doce Rounds", "DR-575", "Guantes de boxeo", "12 oz", "", "$ 34.200"],
  ["Pulso", "PU-580", "Soga de saltar con rulemanes", "", "", "$ 11.300"],
  ["Pulso", "PU-590", "Botella deportiva 1 L", "", "", "$ 8.500"],
  ["Pulso", "PU-600", "Bolso de entrenamiento 40 L", "", "", "$ 31.600"],
  ["Forja", "FJ-610", "Nitro Burn pre-entreno", "300 g", "Ponche", "$ 24.600"],
  ["Brava Sport", "BS-620", "Creatina Brava 100% pura", "500 g", "", "$ 28.900"],
];

/** Lo que se pega en la caja de texto: filas separadas por tabulación, como al copiar de una planilla. */
export const SUPPLIER_PASTE_TEXT = [
  ["MAYORISTA DEL PUERTO · Lista de costos octubre 2026"],
  ["Datos de muestra para la demo · Precios en pesos, IVA incluido"],
  HEADER,
  ...ROWS,
].map((r) => r.join("\t")).join("\n");
