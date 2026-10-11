"use client";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { landingRotation, pickSegment, prizeCoupon, segmentAt } from "@/demo/engine/wheel";
import { playSound } from "@/lib/sound";
import { useAccount } from "@/stores/account";
import { useAdmin, useDemoData } from "@/stores/admin";

/**
 * Lógica de la ruleta (demo: un giro por navegador; en producción el sorteo y el límite van en el servidor).
 * El premio lo decide el sorteo ponderado del engine; el giro y el frenado solo lo muestran.
 */
export function useWheelSpin() {
  const wheel = useDemoData((d) => d.wheel);
  const coupons = useDemoData((d) => d.coupons);
  const addPrizeCoupon = useAdmin((s) => s.addPrizeCoupon);
  const { wheelPrize, setWheelPrize, setWheelSpinning } = useAccount();
  const reduce = useReducedMotion();
  const rotate = useMotionValue(0);
  const kick = useMotionValue(0);
  const [spinning, setSpinning] = useState(false);
  const [justWon, setJustWon] = useState(false);
  const disc = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; last: number; acc: number; start: number; samples: { t: number; r: number }[] } | null>(null);
  const spinningRef = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; useAccount.getState().setWheelSpinning(false); };
  }, []);
  const count = wheel.segments.length;
  const canSpin = wheel.active && !wheelPrize && !spinning;
  // Mientras gira, el premio ya está guardado pero no se muestra hasta que frena.
  const shown = spinning ? null : wheelPrize;
  const prize = shown ? coupons.find((c) => c.code === shown.code) : undefined;

  // Clic de cada casilla y golpecito del puntero cuando pasa un gajo (también al arrastrar con el dedo).
  useEffect(() => {
    let last = segmentAt(rotate.get(), count);
    let lastSound = 0;
    return rotate.on("change", (v) => {
      const idx = segmentAt(v, count);
      if (idx === last) return;
      last = idx;
      const now = performance.now();
      if (now - lastSound > 32) { playSound("tick"); lastSound = now; }
      if (!reduce) void animate(kick, [-16, 0], { duration: 0.18, ease: "easeOut" });
    });
  }, [rotate, kick, count, reduce]);

  /** Gira hacia `dir` con la fuerza del gesto; el frenado lo lleva al gajo sorteado. */
  const spin = async (dir: 1 | -1 = 1, speed = 1) => {
    if (spinningRef.current || useAccount.getState().wheelPrize || !wheel.active) return;
    const pick = pickSegment(wheel);
    if (!pick) return;
    spinningRef.current = true;
    setSpinning(true);
    setWheelSpinning(true);
    // El premio se guarda antes de la animación (que es solo visual): salir a mitad de giro no da otro giro.
    const coupon = prizeCoupon(pick.segment, Math.random().toString(36).slice(2, 7), new Date(), wheel.validDays);
    addPrizeCoupon(coupon);
    setWheelPrize({ code: coupon.code, label: pick.segment.label, at: new Date().toISOString(), choice: "won" });
    playSound("spin");
    const turns = Math.min(8, Math.max(3, Math.round(2 + speed * 2.4)));
    const target = landingRotation(rotate.get(), pick.index, count, dir, turns, Math.random());
    await animate(rotate, target, { duration: reduce ? 0 : Math.min(6.2, 3.2 + turns * 0.35), ease: [0.1, 0.72, 0.16, 1] });
    if (!mounted.current) return;
    spinningRef.current = false;
    setSpinning(false);
    setWheelSpinning(false);
    setJustWon(true);
    playSound("win");
  };

  const angleOf = (e: PointerEvent<HTMLDivElement>) => {
    const r = disc.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      // Solo el botón principal y un dedo a la vez (un segundo dedo o el clic derecho no mezclan el gesto).
      if (!canSpin || e.button !== 0 || drag.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { id: e.pointerId, last: angleOf(e), acc: 0, start: rotate.get(), samples: [{ t: performance.now(), r: rotate.get() }] };
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      const a = angleOf(e);
      let delta = a - d.last;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      d.last = a;
      d.acc += delta;
      rotate.set(d.start + d.acc);
      const now = performance.now();
      d.samples = [...d.samples.filter((s) => now - s.t < 90), { t: now, r: d.start + d.acc }];
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      drag.current = null;
      const first = d.samples[0]!, last = d.samples.at(-1)!;
      const velocity = last.t > first.t ? (last.r - first.r) / (last.t - first.t) : 0; // grados por ms
      // Un toque (casi sin arrastre) gira con la fuerza normal; un empujón gira hacia donde se tiró.
      if (Math.abs(d.acc) < 8) void spin(1, 1);
      else void spin(velocity < 0 ? -1 : 1, Math.max(0.6, Math.abs(velocity) * 1.6));
    },
    onPointerCancel: () => { if (drag.current) rotate.set(drag.current.start); drag.current = null; },
  };

  // Ref de función para el disco: el componente no lee refs durante el render.
  const bindDisc = useCallback((el: HTMLDivElement | null) => { disc.current = el; }, []);
  return { wheel, rotate, kick, bindDisc, handlers, spin, spinning, justWon, canSpin, shown, prize };
}

export type WheelSpinState = ReturnType<typeof useWheelSpin>;
