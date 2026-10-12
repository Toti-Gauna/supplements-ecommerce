import { Hand, Keyboard, Pause } from "lucide-react";
import { gameRules, type GameItemKind } from "@/demo/fixtures/game";
import { GameGlyph } from "./art/GameGlyph";

const GOOD: GameItemKind[] = ["scoop", "capsule", "bolt", "golden"];
const JUNK: GameItemKind[] = ["burger", "soda", "donut"];
const r = gameRules;

function goodNote(kind: GameItemKind): string {
  if (kind === "bolt") return `Puntos dobles ${r.boostSec} s`;
  if (kind === "golden") return `+${r.items.golden.points}, bonus grande`;
  return `+${r.items[kind].points}`;
}

/** "Cómo se juega", armado con las reglas de `fixtures/game.ts` y el mismo dibujo que el juego. */
export function GameHowTo() {
  return (
    <section aria-labelledby="como-se-juega" className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="eyebrow text-volt-ink">Instrucciones</p>
        <h2 id="como-se-juega" className="font-display mt-2 scroll-mt-28 text-4xl leading-tight sm:text-5xl">Cómo se juega</h2>
        <ul className="mt-6 flex flex-col gap-4 text-sm">
          <li className="flex gap-3"><Hand size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" /><span><strong>Mové el shaker</strong> arrastrando con el dedo o con el mouse.</span></li>
          <li className="flex gap-3"><Keyboard size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" /><span><strong>Con teclado:</strong> flechas ← → o A y D.</span></li>
          <li className="flex gap-3"><Pause size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" /><span><strong>Pausa</strong> con Escape o el botón de arriba. Si cambiás de pestaña, se pausa solo.</span></li>
        </ul>
        <p className="mt-5 max-w-md text-sm text-muted">
          {r.durationSec} segundos y {r.lives} vidas. Cada {r.comboStep} seguidas el combo multiplica (hasta ×{r.maxComboMult}). Lo que se te cae no saca vida, pero corta el combo. La velocidad sube con el tiempo.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-display text-2xl">Atrapá</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {GOOD.map((k) => (
              <li key={k} className="flex items-center gap-3 rounded-2xl bg-night px-3 py-2 text-on-night">
                <GameGlyph kind={k} />
                <span className="min-w-0 text-sm"><span className="block font-bold">{r.items[k].label}</span><span className="font-lab text-xs text-volt">{goodNote(k)}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-display text-2xl">Esquivá</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {JUNK.map((k) => (
              <li key={k} className="flex items-center gap-3 rounded-2xl bg-night px-3 py-2 text-on-night">
                <GameGlyph kind={k} />
                <span className="min-w-0 text-sm"><span className="block font-bold">{r.items[k].label}</span><span className="font-lab text-xs text-night-muted">Te saca una vida</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Chatarra = una vida menos y el combo a cero.</p>
        </div>
      </div>
    </section>
  );
}
