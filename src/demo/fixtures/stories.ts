/**
 * "Ciencia simple" del inicio: notas cortas que explican un producto sin promesas. Textos ILUSTRATIVOS escritos para
 * la demo, sin afirmaciones de salud: reemplazar por contenido revisado por la tienda (idealmente con su nutricionista).
 */
export interface ProductStory {
  id: string;
  productSlug: string;
  kicker: string;
  title: string;
  text: string;
}

export const productStories: ProductStory[] = [
  { id: "st1", productSlug: "creatina-monohidrato", kicker: "Mito vs. dato", title: "La creatina no es solo para culturistas", text: "Es de los suplementos más estudiados. 5 g por día, todos los días: no hace falta la fase de carga ni tomarla solo los días de entreno." },
  { id: "st2", productSlug: "ionic-whey", kicker: "Hacé la cuenta", title: "Cuánto te sale cada scoop", text: "Un pote de 5 lb trae 75 servicios. Dividí el precio por los servicios y compará: en cada ficha te lo mostramos hecho." },
  { id: "st3", productSlug: "overvolt-pre", kicker: "Cafeína", title: "Pre-entreno: menos es más", text: "Con 200 mg de cafeína alcanza para la mayoría. Si entrenás de noche, hay opciones sin estimulantes para no perder el sueño." },
  { id: "st4", productSlug: "electrolitos", kicker: "Verano en la costa", title: "Hidratarse no es solo tomar agua", text: "Cuando transpirás mucho perdés sodio y potasio. Un sobre en 500 ml durante el entreno largo hace la diferencia." },
];
