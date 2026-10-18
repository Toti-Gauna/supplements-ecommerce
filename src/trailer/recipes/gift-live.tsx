import { tutienda } from "@/config/brands/tutienda";
import { BrandMarkProvider } from "@/config/brand-mark";
import type { GiftOccasion } from "@/demo/types";
import BoxingBag from "@/features/gifts/scenes/BoxingBag";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TR } from "./kit";
import { Chip } from "./tpl";

export interface GiftLiveProps { occasion: GiftOccasion; title: string; prompts: string[]; done: string; chip: [string, string] }

/** Golpes en corcheas desde el tiempo 0; en el 2 entra la cámara lenta y en el 3 se abre. Escenario 11:15 como en la tienda. */
const HITS = [0, 0.5, 1, 1.5, 2], SLOWMO = 2, OPEN = 3;
const BOX = { w: 520, h: 709, top: 220 };

/**
 * 03 · Regalos que se abren a golpes (37–41): la bolsa REAL de la apertura del regalo, un dibujo por estado (0 a 5 golpes y
 * abierta), quieta (`reduce`) para que el timeline la mueva: péndulo sin escala, anillo de impacto, medidor, cámara lenta y la
 * revelación. Los textos son los de la app y el nombre impreso en la bolsa es el de la tienda que muestra el trailer.
 */
export const giftLive = defineRecipe<GiftLiveProps>({
  id: "gift-live",
  Component: ({ props, ratio }) => {
    const cx = ratio === "9x16" ? 540 : 960, steps = props.prompts.length;
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
        <p className="font-display absolute left-0 right-0 text-center uppercase leading-none" style={{ top: 70, fontSize: 64, color: TR.onNight }}>{props.title}</p>
        {[...props.prompts, props.done].map((t, i) => (
          <p key={i} data-t="prompt" data-i={i} className="absolute left-0 right-0 text-center font-mono font-bold uppercase" style={{ top: 160, fontSize: 28, letterSpacing: "0.2em", color: TR.volt }}>{t}</p>
        ))}
        <div data-t="cam" className="absolute overflow-hidden rounded-md" style={{ left: cx - BOX.w / 2, top: BOX.top, width: BOX.w, height: BOX.h, background: "radial-gradient(ellipse at 50% 30%, #1d2230 0%, #0a0c11 70%)", transformOrigin: "50% 45%" }}>
          <BrandMarkProvider brand={tutienda}>
            <div data-t="swing" className="absolute inset-0" style={{ transformOrigin: "50% 0%" }}>
              {Array.from({ length: steps + 2 }, (_, i) => (
                <div key={i} data-t="state" data-i={i} className="absolute inset-0">
                  <BoxingBag occasion={props.occasion} hits={Math.min(i, steps)} total={steps} opened={i > steps} reduce />
                </div>
              ))}
            </div>
          </BrandMarkProvider>
          <div data-t="ring" className="absolute rounded-full" style={{ left: "50%", top: "52%", width: 180, height: 180, marginLeft: -90, marginTop: -90, boxShadow: `0 0 0 6px ${TR.volt}` }} />
          <div data-t="bars" className="absolute inset-0" style={{ boxShadow: "inset 0 70px 0 #000, inset 0 -70px 0 #000, inset 0 0 160px rgb(0 0 0 / .7)" }} />
        </div>
        <div className="absolute flex" style={{ left: cx - 170, top: BOX.top + BOX.h + 26, gap: 10 }}>
          {Array.from({ length: steps }, (_, i) => <span key={i} data-t="cell" className="block" style={{ width: 60, height: 12, background: TR.volt }} />)}
        </div>
        <Chip n={props.chip[0]} text={props.chip[1]} bottom />
      </div>
    );
  },
  build: ({ q, props, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const steps = props.prompts.length;
    const states = q('[data-t="state"]'), prompts = q('[data-t="prompt"]'), cells = q('[data-t="cell"]');
    const show = (list: HTMLElement[], i: number, at: number) => list.forEach((el, k) => tl.set(el, { autoAlpha: k === i ? 1 : 0 }, at));
    if (reduced) { show(states, steps + 1, 0); show(prompts, steps, 0); tl.set([...q('[data-t="ring"]'), ...q('[data-t="bars"]')], { autoAlpha: 0 }, 0); return tl; }
    show(states, 0, 0); show(prompts, 0, 0);
    tl.set(cells, { opacity: 0.18 }, 0);
    tl.set([...q('[data-t="ring"]'), ...q('[data-t="bars"]')], { autoAlpha: 0 }, 0);
    tl.fromTo(q('[data-t="chip-rule"]'), { scaleX: 0 }, { scaleX: 1, duration: B / 4, ease: "trl.expo" }, 0);
    HITS.forEach((h, k) => {
      const at = h * B, dir = k % 2 ? -1 : 1;
      show(states, k + 1, at);
      show(prompts, Math.min(k + 1, steps - 1), at);
      tl.set(cells[k]!, { opacity: 1 }, at);
      // Péndulo (solo rotación desde la cadena) y el anillo del impacto.
      tl.fromTo(q('[data-t="swing"]'), { rotate: 0 }, { keyframes: [{ rotate: 6 * dir, duration: 0.07, ease: "power2.out" }, { rotate: 0, duration: B / 4, ease: "sine.inOut" }], immediateRender: k === 0 }, at);
      tl.fromTo(q('[data-t="ring"]'), { autoAlpha: 0.9, scale: 0.4 }, { autoAlpha: 0, scale: 1.4, duration: B / 4, ease: "power2.out", immediateRender: false }, at);
    });
    // Cámara lenta de la app: bandas de cine y viñeta, y la cámara se acerca a la bolsa; se abre en el tiempo 3.
    tl.fromTo(q('[data-t="bars"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4, immediateRender: false }, SLOWMO * B);
    tl.fromTo(q('[data-t="cam"]'), { scale: 1 }, { scale: 1.25, duration: B, ease: "trl.rampa" }, SLOWMO * B);
    show(states, steps + 1, OPEN * B);
    show(prompts, steps, OPEN * B);
    tl.to(q('[data-t="bars"]'), { autoAlpha: 0, duration: B / 4, immediateRender: false }, OPEN * B);
    tl.to(q('[data-t="cam"]'), { scale: 1, duration: B / 2, ease: "trl.expo", immediateRender: false }, OPEN * B);
    return tl;
  },
});
