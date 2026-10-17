/**
 * El descuento que muestra el marcador de la pantalla de carga (R3c): un cuentakilómetros de hasta 3 ruedas que gira
 * hasta el número (solo transform), con lo de antes y después fijo ("−" y " %", o "−$ " y ".000").
 *
 * Esta función se copia tal cual (con `toString`) adentro del script del <head> (`seasonScript.ts`), que corre antes
 * de que exista la página: tiene que ser autocontenida, sin imports ni nada de afuera.
 */
export interface SplashOff {
  pre: string;
  suf: string;
  /** Cuántas ruedas se ven (1 a 3). */
  dn: number;
  /** Las tres ruedas (centena, decena, unidad); las de la izquierda que sobran quedan en 0 y ocultas. */
  cols: [number, number, number];
}

interface SplashCoupon {
  type: string;
  value: number;
  active?: boolean;
}

export function splashOff(c: SplashCoupon | null | undefined): SplashOff | null {
  if (!c || c.active === false || c.type === "FREE_SHIPPING" || !(c.value > 0)) return null;
  let v = Math.round(c.value);
  let pre = "−";
  let suf = " %";
  if (c.type === "FIXED") {
    pre = "−$ ";
    suf = "";
    if (v >= 1000) {
      suf = "." + String(v % 1000).padStart(3, "0");
      v = Math.floor(v / 1000);
    }
  }
  const s = String(v);
  if (s.length > 3) return null;
  const p = s.padStart(3, "0");
  return { pre, suf, dn: s.length, cols: [Number(p[0]), Number(p[1]), Number(p[2])] };
}
