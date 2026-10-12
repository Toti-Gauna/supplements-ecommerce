/** Colores de un modo (oscuro o claro "Tiza"). El contraste AA de cada par se verifica en tests/unit/brand.test.ts. */
export interface BrandPalette {
  primary: string;
  primaryHover: string;
  onPrimary: string;
  /** Superficie suave: chips, hover, fondos de campos. */
  accent: string;
  /** Acento decorativo frío (datos, brillos). No es texto sobre fondo claro. */
  ion: string;
  /** Acento de energía (brillos, degradés). */
  plasma: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  /** Bandas oscuras (club, pie, menú del panel): oscuras en los dos modos. */
  night: string;
  night2: string;
  /** Texto de acento sobre el fondo (links destacados, cifras). */
  voltInk: string;
}

/**
 * Colores fijos de la marca, iguales en los dos modos: el rayo del logo, la pantalla de carga, las bandas "noche" y el
 * arte (potes, ruleta, juego, regalos, Estudio). Van en hex porque el Estudio pasa el arte a imagen.
 */
export interface BrandSignature {
  /** Color firma (el "voltio" de VOLTA): rayo, brillos, texto de acento sobre las bandas noche. */
  volt: string;
  /** Versión clara del color firma (destellos, foco sobre fondos oscuros). */
  voltSoft: string;
  /** Segundo color de energía (halos, degradés). */
  plasma: string;
  /** Tercer acento para datos y destellos fríos. */
  ion: string;
  /** Texto y texto apagado sobre las bandas noche. */
  onNight: string;
  nightMuted: string;
}

/** Lo que se completa al armar una marca nueva (ver docs/marca-blanca.md). */
export interface BrandInput {
  /** Identificador corto: minúsculas, sin espacios ni acentos ("nitro"). Va en nombres de archivo y links de muestra. */
  id: string;
  /** Nombre como se escribe ("Nitro"). */
  name: string;
  /** Nombre en mayúsculas para grabados y rótulos (disco de la ruleta, bolsa de boxeo, potes). Por defecto, el nombre. */
  mark?: string;
  /** Bajada corta debajo del nombre (header del panel, pie, pantalla de carga). */
  descriptor: string;
  tagline: string;
  city: string;
  /** Usuario de Instagram sin "@", o null. */
  instagram: string | null;
  /** Número en formato internacional sin "+" (5492235550000). null = no confirmado: WhatsApp abre sin destinatario. */
  whatsappNumber: string | null;
  email: string | null;
  legalName: string | null;
  cuit: string | null;
  /** Marca propia de la tienda en el catálogo de muestra. Por defecto "<MARCA> Lab". */
  houseBrand?: string;
  /** Prefijo de los códigos de pedido ("VOL" → VOL-000123). Por defecto, las tres primeras letras de `mark`. */
  orderPrefix?: string;
  /** Logo: "v-bolt" (la "V" con rayo, solo para nombres con V) o "bolt" (rayo solo, sirve para cualquier nombre). */
  logo?: "v-bolt" | "bolt";
  paletteStatus: "provisional" | "confirmada";
  /** Modo con el que abre la tienda si la persona no eligió otro. */
  defaultMode: "dark" | "light";
  /** Paleta del modo oscuro (el de la marca). */
  colors: BrandPalette;
  /** Paleta del modo claro "Tiza". */
  light: BrandPalette;
  signature: BrandSignature;
  /** Prefijo de lo que la demo guarda en el navegador. No cambiarlo en una demo ya mostrada. Por defecto, el id. */
  storageKey?: string;
}

/** Marca lista para usar: lo cargado más lo que se deriva (mayúsculas, club, marca propia). */
export interface BrandConfig extends Required<Omit<BrandInput, "houseBrand">> {
  /** Marca propia de la tienda en el catálogo ("VOLTA Lab") y su rótulo en mayúsculas ("VOLTA LAB"). */
  houseBrand: string;
  houseMark: string;
  /** Nombre del club de beneficios ("Club Volta"). */
  club: string;
  /** Dominio ficticio de los emails de muestra ("volta.demo"). */
  demoDomain: string;
  fontFamily: string;
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Completa una marca con sus valores derivados. Falla en el build si el id no sirve para archivos y links. */
export function defineBrand(input: BrandInput): BrandConfig {
  if (!ID.test(input.id)) throw new Error(`Marca "${input.name}": el id "${input.id}" tiene que ir en minúsculas, sin espacios ni acentos.`);
  const mark = input.mark ?? input.name.toUpperCase();
  const houseBrand = input.houseBrand ?? `${mark} Lab`;
  return {
    ...input,
    mark,
    houseBrand,
    houseMark: houseBrand.toUpperCase(),
    orderPrefix: input.orderPrefix ?? mark.normalize("NFD").replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase(),
    logo: input.logo ?? "bolt",
    storageKey: input.storageKey ?? input.id,
    club: `Club ${input.name}`,
    demoDomain: `${input.id}.demo`,
    fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif",
  };
}
