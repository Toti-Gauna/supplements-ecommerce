import { tutienda } from "@/config/brands/tutienda";
import { BrandMarkProvider } from "@/config/brand-mark";
import { defaultWheel } from "@/demo/fixtures/wheel";
import { WheelCollar } from "@/features/club/WheelCollar";
import { WheelDisc } from "@/features/club/WheelDisc";
import { WheelHub } from "@/features/club/WheelHub";
import { WheelRim } from "@/features/club/WheelRim";
import { STAGE_GLOW } from "@/features/club/wheel-art";
import { cssAnimations, setCssTime } from "../engine/css-clock";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TR } from "./kit";
import { Chip } from "./tpl";

export interface WheelLiveProps { eyebrow: string; title: string; prize: number; chip: [string, string] }

const DIAL = 860;
/**
 * Frenada escrita en tiempos (desde el inicio de la escena): las fronteras entre gajos pasan por el puntero en fusas, en
 * semicorcheas y en una corchea, y el disco se detiene en el centro del premio en el tiempo 3. Con 8 gajos de 45°, cada
 * frontera es un múltiplo de 45° y el premio 0 queda arriba en 337,5° (+ 2 vueltas).
 */
export const WHEEL_STEPS = [...Array.from({ length: 8 }, (_, k) => 0.5 + k / 8), ...Array.from({ length: 4 }, (_, k) => 1.5 + k / 4), 2.5];
export const wheelLanding = (prize: number) => 720 + 360 - (prize * 45 + 22.5);
export const wheelBoundary = (prize: number, k: number) => wheelLanding(prize) - 22.5 - (WHEEL_STEPS.length - 1 - k) * 45;
const STOP = 3;

/**
 * 05 · Ruleta de cupones (44–48): la ruleta "disco olímpico" REAL (disco, aro de luces, traba y maza) con el giro, el cabeceo de
 * la traba y el premio manejados por el timeline; las luces y el gajo ganador titilan con su animación CSS, atada al reloj.
 */
export const wheelLive = defineRecipe<WheelLiveProps>({
  id: "wheel-live",
  Component: ({ props, ratio }) => {
    const cx = ratio === "9x16" ? 540 : 960, cy = ratio === "9x16" ? 960 : 570;
    const segments = defaultWheel.segments;
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 55%, ${STAGE_GLOW[0]}66 0%, ${STAGE_GLOW[1]}33 40%, ${TR.night} 75%)` }}>
        <p className="eyebrow absolute left-0 right-0 text-center" style={{ top: 34, fontSize: 22, color: TR.muted }}>{props.eyebrow}</p>
        <p className="font-display absolute left-0 right-0 text-center uppercase leading-none" style={{ top: 66, fontSize: 52, color: TR.onNight }}>{props.title}</p>
        <BrandMarkProvider brand={tutienda}>
          <div className="absolute aspect-square select-none rounded-full" style={{ left: cx - DIAL / 2, top: cy - DIAL / 2 + 40, width: DIAL }}>
            <div aria-hidden="true" className="absolute inset-[1%] rounded-full shadow-[0_34px_70px_-26px_rgb(0_0_0/0.95)]" />
            <div data-t="disc" className="absolute inset-[4.4%] rounded-full">
              <WheelDisc segments={segments} />
              <div data-t="landed" className="absolute inset-0"><WheelDisc segments={segments} landed={props.prize} /></div>
            </div>
            <div data-t="rim-idle" className="absolute inset-0"><WheelRim lights="idle" /></div>
            <div data-t="rim-win" className="absolute inset-0"><WheelRim lights="win" /></div>
            <div data-t="collar" className="absolute inset-0"><WheelCollar /></div>
            <WheelHub />
            <svg aria-hidden="true" className="absolute inset-0 overflow-visible" width={DIAL} height={DIAL}>
              <circle data-t="ring" cx={DIAL / 2} cy={DIAL / 2} r={DIAL / 2 + 14} fill="none" stroke={TR.volt} strokeWidth={2} pathLength={100} strokeDasharray={100}
                transform={`rotate(-90 ${DIAL / 2} ${DIAL / 2})`} />
            </svg>
          </div>
        </BrandMarkProvider>
        <Chip n={props.chip[0]} text={props.chip[1]} />
      </div>
    );
  },
  build: ({ q, props, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const one = (s: string) => q(`[data-t="${s}"]`);
    const collar = q('[data-t="collar"] svg');
    const win = cssAnimations([...one("landed"), ...one("rim-win")]);
    const land = wheelLanding(props.prize);
    if (reduced) {
      tl.set(one("disc"), { rotate: land }, 0); tl.set(one("rim-idle"), { autoAlpha: 0 }, 0); tl.set(one("ring"), { autoAlpha: 0 }, 0);
      setCssTime(win, 5000);
      return tl;
    }
    setCssTime(win, 0);
    tl.set([...one("landed"), ...one("rim-win")], { autoAlpha: 0 }, 0);
    tl.fromTo(one("chip-rule"), { scaleX: 0 }, { scaleX: 1, duration: B / 4, ease: "trl.expo" }, 0);
    // El anillo de 1 px recorre el borde en sentido horario desde el puntero (½ tiempo).
    tl.fromTo(one("ring"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: B / 2, ease: "power2.inOut" }, 0);
    tl.to(one("ring"), { autoAlpha: 0, duration: B / 4, immediateRender: false }, B / 2);
    // Giro: arranca un octavo antes de la primera frontera, pasa por las 13 en sus tiempos y frena en el premio.
    const start = wheelBoundary(props.prize, 0) - 22.5;
    const keys: gsap.TweenVars[] = [{ rotate: wheelBoundary(props.prize, 0), duration: B / 8, ease: "power2.in" }];
    WHEEL_STEPS.slice(1).forEach((t, k) => keys.push({ rotate: wheelBoundary(props.prize, k + 1), duration: (t - WHEEL_STEPS[k]!) * B, ease: "none" }));
    keys.push({ rotate: land, duration: (STOP - WHEEL_STEPS.at(-1)!) * B, ease: "power2.out" });
    tl.set(one("disc"), { rotate: start }, 0);
    tl.to(one("disc"), { keyframes: keys, immediateRender: false }, (WHEEL_STEPS[0]! - 1 / 8) * B);
    // La traba cabecea en cada frontera (−12° → 0 en un octavo de tiempo).
    tl.set(collar, { rotate: 0, transformOrigin: "50% 26%" }, 0);
    WHEEL_STEPS.forEach((t, k) => tl.fromTo(collar, { rotate: -12 }, { rotate: 0, duration: Math.min(B / 8, ((WHEEL_STEPS[k + 1] ?? t + 1) - t) * B), ease: "power2.out", immediateRender: false }, t * B));
    // En el tiempo 3: gajo ganador y luces de premio, con su titileo CSS atado al reloj.
    tl.set([...one("landed"), ...one("rim-win")], { autoAlpha: 1 }, STOP * B);
    tl.set(one("rim-idle"), { autoAlpha: 0 }, STOP * B);
    const clock = { t: 0 };
    tl.fromTo(clock, { t: 0 }, { t: B, duration: B, ease: "none", onUpdate: () => setCssTime(win, clock.t * 1000) }, STOP * B);
    return tl;
  },
});
