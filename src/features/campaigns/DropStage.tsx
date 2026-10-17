import { CampaignArt } from "@/components/illustrations/campaigns";
import { RackShot, type RackItem } from "@/components/illustrations/RackShot";
import { rackFacts } from "@/demo/engine/rack";
import type { Product, SeasonId } from "@/demo/types";
import { cn } from "@/lib/cn";
import s from "./campaign.module.css";

const item = (p: Product): RackItem => ({ art: p.art, pack: p.pack, tint: rackFacts(p).lead.colorHex });

/** "Isolate Zero, Ionic Whey y Mass Gainer". */
const list = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} y ${names.at(-1)}` : names[0] ?? "");

interface DropStageProps {
  id: SeasonId;
  /** Productos de la campaña: los tres primeros van al rack. */
  products: Product[];
  /** Sala de espera: el rack en penumbra (se adivina, no se muestra). */
  veiled?: boolean;
  className?: string;
}

/**
 * Escenario del drop: reflectores y humo con la luz de la fecha, el key visual de la campaña (4:5) a un costado y, al
 * frente, el rack con los productos reales de la campaña. Capas quietas; los reflectores se prenden una vez.
 */
export function DropStage({ id, products, veiled = false, className }: DropStageProps) {
  const rack = products.slice(0, 3);
  return (
    <div aria-hidden={veiled || undefined} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div aria-hidden="true" className={s.lightsOn}>
        <div className={s.haze} />
        <div className={cn(s.beam, "left-[46%] h-[110%] w-[44%] lg:left-[58%]")} />
        <div className={cn(s.beam, "left-[78%] h-[100%] w-[30%] rotate-[24deg] opacity-60 max-lg:hidden")} />
        <div className={s.floor} />
      </div>
      <div className={cn(s.art, "absolute right-[-18%] top-0 aspect-[4/5] h-[70%] text-on-night opacity-80 sm:right-0 sm:h-[86%] lg:right-0 lg:h-full lg:opacity-100")}>
        <CampaignArt id={id} className="h-full w-full" />
      </div>
      {rack.length > 0 && (
        <div className={cn("absolute right-0 top-0 h-[38%] w-[56%] sm:right-[4%] sm:top-2 sm:h-[54%] sm:w-[48%] lg:bottom-6 lg:right-[24%] lg:top-auto lg:h-[64%] lg:w-[34%]", veiled && "brightness-[0.18] saturate-0")}>
          <RackShot items={rack.map(item)} uprights lightUp fit label={veiled ? "" : `${list(rack.map((p) => p.name))}, los productos de la campaña`} />
        </div>
      )}
      <span aria-hidden="true" className={s.slash} />
    </div>
  );
}
