"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { checkGamePrizes, GAME_PRIZE_LIMITS, hasGamePrizeErrors, newGameTier, normalizeGamePrizes, type GamePrizeErrors } from "@/demo/admin/game-prizes";
import { gameRules, type GamePrizeConfig, type GamePrizeTier } from "@/demo/fixtures/game";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";
import { COUPONS_SECTION } from "./CouponsHub";
import { GamePrizesPreview } from "./GamePrizesPreview";
import { GameTierRow } from "./GameTierRow";

const NO_ERRORS: GamePrizeErrors = { tiers: {}, general: [] };
const isDraft = (x: unknown): x is GamePrizeConfig => {
  const d = x as GamePrizeConfig | null;
  return !!d && typeof d.active === "boolean" && Array.isArray(d.tiers) && d.tiers.every((t) => typeof t?.id === "string" && typeof t.minScore === "number" && typeof t.validDays === "number");
};
let seq = 0;
const tierId = () => `g-${Date.now().toString(36)}${++seq}`;

/**
 * Premios de Shaker Rush (Fase 7, Marketing → Cupones y ruleta): niveles por puntaje con su premio y vencimiento.
 * Guardar cambia los premios del juego de la tienda de este navegador; los cupones ya ganados no cambian.
 */
export function GamePrizesAdmin() {
  const saved = useAdmin((s) => s.data.game);
  // Si lo guardado cambia por fuera (Reiniciar demo, otra pestaña), el formulario arranca de nuevo desde ahí.
  return <GamePrizesForm key={JSON.stringify(saved)} saved={saved} />;
}

function GamePrizesForm({ saved }: { saved: GamePrizeConfig }) {
  const saveGamePrizes = useAdmin((s) => s.saveGamePrizes);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<GamePrizeConfig>("volta-ui:marketing-draft:game", saved, isDraft);
  const d = session.draft;
  const [errors, setErrors] = useState<GamePrizeErrors>(NO_ERRORS);
  const live = checkGamePrizes(d, gameRules);
  const change = (next: GamePrizeConfig) => { session.setDraft(next); setErrors(NO_ERRORS); };
  const patch = (id: string, p: Partial<GamePrizeTier>) => change({ ...d, tiers: d.tiers.map((t) => (t.id === id ? { ...t, ...p } : t)) });
  const full = d.tiers.length >= GAME_PRIZE_LIMITS.tiers.max;
  const submit = () => {
    const found = checkGamePrizes(d, gameRules);
    setErrors(found);
    if (hasGamePrizeErrors(found)) return;
    saveGamePrizes(normalizeGamePrizes(d));
    push({ tone: "success", title: "Premios del juego guardados", description: "Shaker Rush ya usa los premios nuevos en este navegador. Los cupones que ya se ganaron no cambian (solo en esta demo).", action: { label: "Ver el juego", href: "/club/juego/" } });
  };
  return (
    <div>
      <SubpageHeader trail={[MARKETING, COUPONS_SECTION]} back={COUPONS_SECTION} title="Premios del juego"
        intro="Shaker Rush: desde cuántos puntos se gana cada cupón, qué descuento da y en cuántos días vence. Se juega todas las veces que quieran; el cupón se gana una vez por día." />
      {session.restored && <p role="status" className="mb-4 rounded-sm bg-warning-soft px-3 py-2 text-sm font-bold text-warning">Recuperamos los cambios que quedaron sin guardar.</p>}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="gp-levels" className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
          <Switch checked={d.active} onChange={(active) => change({ ...d, active })} label={d.active ? "Se entregan cupones" : "Premios pausados"}
            description="Pausados, el juego sigue en la tienda pero no entrega cupones." />
          <h2 id="gp-levels" className="font-bold">Niveles de premio <span className="font-normal text-muted">({d.tiers.length} de {GAME_PRIZE_LIMITS.tiers.max})</span></h2>
          {errors.general.length > 0 && <ul role="alert" className="flex flex-col gap-1 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">{errors.general.map((e) => <li key={e}>{e}</li>)}</ul>}
          <ol className="flex flex-col gap-3">
            {d.tiers.map((t, i) => (
              <GameTierRow key={t.id} tier={t} n={i + 1} errors={errors.tiers[t.id]} canRemove={d.tiers.length > 1}
                onChange={(p) => patch(t.id, p)} onRemove={() => change({ ...d, tiers: d.tiers.filter((x) => x.id !== t.id) })} />
            ))}
          </ol>
          <Button variant="secondary" size="sm" className="self-start" disabled={full} onClick={() => change({ ...d, tiers: [...d.tiers, newGameTier(d.tiers, tierId())] })}>
            <Plus size={16} aria-hidden="true" /> Agregar nivel
          </Button>
          <p className="rounded-sm bg-accent/60 px-3 py-2 text-xs text-muted">Al guardar, los niveles se ordenan solos por puntaje. Una partida buena ronda los 1.000 a 1.500 puntos. En producción los premios se guardan en el servidor, que también valida el puntaje.</p>
        </section>
        <GamePrizesPreview config={d} valid={!hasGamePrizeErrors(live)} />
      </div>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar premios" discardText="Los premios vuelven a como están guardados." onDiscard={() => { session.reset(); setErrors(NO_ERRORS); }} />
    </div>
  );
}
