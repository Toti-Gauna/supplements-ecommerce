import type { ArtKey, PackStyle } from "@/demo/types";
import { ProductArt } from "@/components/illustrations/ProductArt";

/** Miniatura de un ítem (carrito, pedido, panel): el envase con el color del sabor elegido. */
export function LineThumb({ art, pack, tint, name }: { art: ArtKey; pack?: PackStyle; tint?: string; name: string }) {
  return <ProductArt art={art} pack={pack} tint={tint} label={name} showBadge={false} className="aspect-square rounded-xl" />;
}
