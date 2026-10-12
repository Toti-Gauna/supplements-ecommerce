import { brand } from "@/config/brand";
import { logoIconSvg } from "@/config/logo";

export const dynamic = "force-static";

/** Favicon generado en build con el símbolo y los colores de la marca → out/brand-icon.svg */
export function GET() {
  return new Response(logoIconSvg(brand), { headers: { "Content-Type": "image/svg+xml" } });
}
