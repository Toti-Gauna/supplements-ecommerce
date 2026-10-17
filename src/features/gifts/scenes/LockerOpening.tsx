"use client";
import { AlertTriangle, KeyRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/atoms/Field";
import { LOCKER, OPENING_TIMING, checkLockerCode, lockerCodeOf, lockerUsesDate } from "@/demo/engine/gift-opening";
import type { Gift } from "@/demo/engine/gifts";
import type { GiftOccasion } from "@/demo/types";
import { formatDay, toDayKey } from "@/lib/date";
import { playSound } from "@/lib/sound";
import { SceneStyle } from "./kit";
import { LOCKER_CSS, LockerArt, type LockerStatus } from "./locker/LockerArt";
import { OpeningStage } from "./stage/OpeningStage";
import type { StageColors } from "./stage/types";
import { useTween } from "./stage/useTween";

interface Props {
  gift: Pick<Gift, "from" | "createdAt" | "lockerCode">;
  occasion: GiftOccasion;
  c: StageColors;
  reduce: boolean;
  onOpened: () => void;
  autoFocus?: boolean;
}

const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch { /* sin vibración */ } };

/**
 * Locker con combinación (la otra apertura que puede elegir quien regala): cuatro números, por defecto el día y el
 * mes del regalo. Con la correcta corre el pestillo, la puerta gira y se prende la luz de adentro. Accesible: un
 * campo numérico con su etiqueta y su pista, el error se anuncia y, tras tres intentos, "Abrirlo de una vez".
 */
export function LockerOpening({ gift, occasion, c, reduce, onOpened, autoFocus }: Props) {
  const code = lockerCodeOf(gift);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<LockerStatus>("idle");
  const [misses, setMisses] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(onOpened);
  useEffect(() => { done.current = onOpened; }, [onOpened]);
  useEffect(() => { if (autoFocus) input.current?.focus({ preventScroll: true }); }, [autoFocus]);
  const swing = useTween(status === "open" ? 1 : 0, 1100, reduce);
  const opened = status === "open";

  useEffect(() => {
    if (status === "unlocking") {
      const t = window.setTimeout(() => setStatus("open"), reduce ? 0 : 480);
      return () => window.clearTimeout(t);
    }
    if (status !== "open") return;
    const s = window.setTimeout(() => playSound("open"), 160);
    const t = window.setTimeout(() => done.current(), reduce ? OPENING_TIMING.revealReduced : OPENING_TIMING.reveal);
    return () => { window.clearTimeout(s); window.clearTimeout(t); };
  }, [status, reduce]);

  const type = (next: string) => {
    const digits = next.replace(/\D/g, "").slice(0, 4);
    if (digits.length > value.length) playSound("tick");
    setValue(digits);
    setError(null);
    if (status === "wrong") setStatus("idle");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (status === "unlocking" || opened) return;
    const check = checkLockerCode(value, code);
    if (check === "incomplete") { setError("Faltan números: la combinación tiene 4."); playSound("error"); return; }
    if (check === "wrong") {
      setMisses((m) => m + 1);
      setStatus("wrong");
      setError("Esa combinación no abre. Probá de nuevo.");
      playSound("error");
      vibrate([30, 40, 30]);
      return;
    }
    setStatus("unlocking");
    playSound("hit", 6);
    vibrate([20, 30, 70]);
  };
  const openNow = () => { setValue(code); setStatus("unlocking"); playSound("hit", 6); };

  const usesDate = lockerUsesDate(gift);
  const hint = usesDate ? "Pista: el día y el mes en que te lo regalaron, en 4 números (DDMM)." : `${gift.from} te pasó la combinación junto con el regalo.`;
  const phase = opened ? "open" : misses > 0 ? "hit" : "idle";
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <SceneStyle id="locker" css={LOCKER_CSS} />
      <p className="min-h-[1.5rem] text-center text-sm font-extrabold uppercase tracking-[0.18em] text-volt-soft sm:text-base" aria-hidden="true">{opened || status === "unlocking" ? LOCKER.done : "Abrí el locker"}</p>
      <div className="relative mt-3 aspect-[4/5] w-[min(86vw,calc((100dvh-22rem)*0.8),400px)] overflow-hidden rounded-sm shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)] ring-1 ring-white/12" aria-hidden="true">
        <OpeningStage scene="locker" meta={LOCKER} c={c} hits={misses} phase={phase} reduce={reduce}
          draw={(u) => <LockerArt u={u} c={c} digits={value} status={status} misses={misses} swing={swing} />}
          data={{ "data-variant": occasion, "data-opening": "locker", "data-locker": status, "data-open": opened ? "true" : "false" }} />
      </div>
      <form onSubmit={submit} noValidate className="mt-5 flex w-full max-w-xs flex-col gap-2 text-left">
        <label htmlFor="locker-code" className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-on-night">Combinación del locker</label>
        <div className="flex gap-2">
          <Input ref={input} id="locker-code" value={value} onChange={(e) => type(e.target.value)} inputMode="numeric" autoComplete="off" pattern="[0-9]*"
            placeholder="····" aria-invalid={Boolean(error)} aria-describedby={error ? "locker-code-error" : "locker-code-hint"} disabled={opened}
            className="border-white/25 bg-white/5 text-center font-mono text-2xl font-extrabold tracking-[0.5em] text-on-night placeholder:text-night-muted hover:border-white/50 focus:border-volt-soft" />
          <button type="submit" disabled={opened} className="flex min-h-12 shrink-0 items-center gap-2 rounded-sm bg-volt-soft px-4 font-bold text-night hover:brightness-105 disabled:opacity-60">
            <KeyRound size={18} aria-hidden="true" /> Abrir
          </button>
        </div>
        {error ? (
          <p id="locker-code-error" role="alert" className="flex items-center gap-2 text-sm font-semibold text-on-night"><AlertTriangle size={16} aria-hidden="true" className="shrink-0 text-volt-soft" />{error}</p>
        ) : (
          <p id="locker-code-hint" className="text-sm text-night-muted">{hint}</p>
        )}
        {usesDate && misses >= 2 && !opened && <p className="text-sm text-night-muted">Te lo regalaron el {formatDay(toDayKey(gift.createdAt), "long")}.</p>}
      </form>
      <p aria-live="polite" className="sr-only">{status === "unlocking" ? "Combinación correcta." : opened ? "¡Se abrió el locker!" : ""}</p>
      <div className="mt-3 h-10">
        {misses >= 3 && !opened && status !== "unlocking" && (
          <button type="button" onClick={openNow} className="rounded-sm px-4 py-2 text-sm font-semibold text-night-muted underline-offset-4 hover:text-on-night hover:underline">
            Abrirlo de una vez
          </button>
        )}
      </div>
    </div>
  );
}
