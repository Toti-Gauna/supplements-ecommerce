import { Check } from "lucide-react";
import { gamePrizes, gameRules, type GameItemKind } from "@/demo/fixtures/game";
import { cn } from "@/lib/cn";
import { GameGlyph } from "./art/GameGlyph";

const GOOD: GameItemKind[] = ["scoop", "capsule", "bolt", "golden"];
const JUNK: GameItemKind[] = ["burger", "soda", "donut"];
const tiers = [...gamePrizes.tiers].sort((a, b) => a.minScore - b.minScore);
const aside = "hidden w-56 shrink-0 flex-col justify-center gap-3 px-6 lg:flex xl:w-64";

/** En pantallas anchas, a la izquierda del campo: qué atrapar y qué esquivar (el mismo dibujo que cae). */
export function LegendAside() {
  return (
    <aside aria-label="Qué atrapar y qué esquivar" className={aside}>
      <p className="eyebrow text-volt">Atrapá</p>
      <ul className="flex flex-col gap-2">
        {GOOD.map((k) => (
          <li key={k} className="flex items-center gap-3 text-sm"><GameGlyph kind={k} className="h-9 w-9" />
            <span><span className="block font-bold">{gameRules.items[k].label}</span><span className="font-lab text-xs text-night-muted">{k === "bolt" ? `×2 por ${gameRules.boostSec} s` : `+${gameRules.items[k].points}`}</span></span>
          </li>
        ))}
      </ul>
      <p className="eyebrow mt-4 text-[var(--game-alert)]">Esquivá</p>
      <ul className="flex flex-col gap-2">
        {JUNK.map((k) => (
          <li key={k} className="flex items-center gap-3 text-sm"><GameGlyph kind={k} className="h-9 w-9" />
            <span><span className="block font-bold">{gameRules.items[k].label}</span><span className="font-lab text-xs text-night-muted">−1 vida</span></span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** A la derecha del campo: la escalera de premios con lo que ya se alcanzó en esta partida. */
export function PrizeAside({ score }: { score: number }) {
  return (
    <aside aria-label="Premios por puntaje" className={aside}>
      <p className="eyebrow text-volt">Premios</p>
      <ol className="flex flex-col-reverse gap-2">
        {tiers.map((t) => {
          const reached = score >= t.minScore;
          return (
            <li key={t.id} className={cn("rounded-2xl p-3 ring-1", reached ? "bg-volt/10 ring-volt/60" : "ring-white/10")}>
              <span className="font-lab block text-xs text-night-muted">{t.minScore.toLocaleString("es-AR")} pts</span>
              <span className="flex items-center gap-1.5 font-display text-xl">{reached && <Check size={16} aria-label="alcanzado" className="text-volt" />}{t.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-night-muted">Un cupón por día: el de la primera partida que llegue a un nivel.</p>
    </aside>
  );
}
