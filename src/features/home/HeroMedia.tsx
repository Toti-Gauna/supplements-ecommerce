import { HeroScene } from "@/components/illustrations/HeroScene";
import type { RackItem } from "@/components/illustrations/RackShot";
import { heroNeighbors, type HeroPick } from "@/demo/engine/home";
import { rackFacts } from "@/demo/engine/rack";
import type { Product } from "@/demo/types";

const item = (p: Product): RackItem => ({ art: p.art, pack: p.pack, tint: rackFacts(p).lead.colorHex });

/**
 * La imagen que protagoniza la diapositiva: la imagen propia del destacado (a sangre, con su encuadre del panel) o la
 * escena ilustrada del producto en el box. `deferred`: reserva el lugar sin dibujar nada (diapositivas fuera de
 * pantalla hasta la primera interacción, para no sumar trabajo al primer pantallazo).
 */
export function HeroMedia({ pick, deferred }: { pick: HeroPick; deferred: boolean }) {
  if (deferred) return null;
  const p = pick.product;
  if (pick.image) {
    const { x, y, zoom } = pick.image.frame;
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen propia del panel demo (data URL local, sin red) */}
        <img src={pick.image.src} alt={pick.image.alt} width={1600} height={900} className="h-full w-full object-cover"
          style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }} />
      </div>
    );
  }
  return (
    <div className="hero-art absolute inset-x-0 -top-10 h-[19.5rem] sm:top-0 sm:h-[72%] lg:inset-y-0 lg:left-auto lg:h-full lg:w-[64%]">
      <HeroScene items={[item(p), ...heroNeighbors(p).map(item)]} label={p.imageAlt || p.name} pose={p.goals?.[0] ?? "fuerza"} photo={p.photoDataUrl} />    </div>
  );
}
