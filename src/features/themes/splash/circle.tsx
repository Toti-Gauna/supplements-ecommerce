"use client";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { SceneCss, useDelay, vars } from "./kit";
import { Burst, Letters, Ring, RigCss, Strip } from "./rig";

/**
 * Navidad: una corona alrededor del logo. Se dibuja el aro dorado, entran las bolas (discos de pesas), los copos y
 * los regalos uno por uno, y arriba se prende la estrella (el destello de VOLTA) con un estallido.
 */
export function ChristmasScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="circle" css={CSS} />
      <Ring kinds={["ornament", "snowflake", "ornament", "gift"]} count={11} from={-60} span={300} start={0.55} step={0.1} shape="ellipse">
        <span className="nv-wreath" style={d(0.3)} />
        <span data-sc className="sc-piece sc-pop nv-star" style={{ ...vars({ "--x": "0px", "--y": "calc(var(--ry) * -1)" }), ...d(1.7) }}>
          <Decor kind="spark" className="h-full w-full" />
        </span>
        <Burst x="0px" y="calc(var(--ry) * -1)" at={1.78} colors={["#f3c84c", "#ffffff", "#e5544a"]} n={14} r="58px" />
        <p className="sc-below sc-tall nv-text font-display font-wide"><Letters text="Felices fiestas" at={2.1} /></p>
      </Ring>
    </>
  );
}

const T = ["T-3", "T-2", "T-1", "¡Activada!"];

/**
 * Operación verano: el logo es el sol. Los rayos crecen alrededor uno por uno y giran lento, suben las olas de la
 * costa, aparecen los anteojos y la botella, y la cuenta regresiva termina en "¡Activada!".
 */
export function SummerScene() {
  const d = useDelay();
  const side = (k: number) => vars({ "--x": `calc((var(--R) + 30px + var(--s) / 2) * ${k * 0.643})`, "--y": "calc((var(--R) + 30px + var(--s) / 2) * .766)" });
  return (
    <>
      <RigCss /><SceneCss id="circle" css={CSS} />
      <span className="ov-glow" style={d(0.2)} />
      <div className="ov">
        <div className="ov-rays" style={d(0.3)}>
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} data-sc className="ov-arm" style={vars({ "--a": `${i * 20}deg` })}><span className="ov-ray" style={d(0.3 + i * 0.05)} /></span>
          ))}
        </div>
        <div className="sc-ring" style={vars({ "--s": "44px", left: "0px", top: "0px" })}>
          <span data-sc className="sc-piece sc-pop sc-tall" style={{ ...side(-1), ...d(1.5) }}><Decor kind="sunglasses" className="h-full w-full" /></span>
          <span data-sc className="sc-piece sc-pop sc-tall" style={{ ...side(1), ...d(1.65) }}><Decor kind="bottle" className="h-full w-full" /></span>
        </div>
        <p className="ov-count sc-tall font-lab"><Strip values={T} at={0.6} dur={1.8} /></p>
      </div>
      {[0, 1].map((i) => (
        <svg key={i} data-sc viewBox="0 0 400 60" preserveAspectRatio="none" className={`ov-wave ov-wave-${i}`} style={d(0.6 + i * 0.2, 1.6 + i * 0.2)} aria-hidden="true">
          <path d="M0 30Q50 10 100 30T200 30T300 30T400 30V60H0z" fill={i ? "#0b6f96" : "#5ee8da"} opacity={i ? 0.9 : 0.55} />
        </svg>
      ))}
    </>
  );
}

const CSS = `
.nv-wreath { position: absolute; left: calc(-1 * var(--rx)); top: calc(-1 * var(--ry)); width: calc(var(--rx) * 2); height: calc(var(--ry) * 2); border-radius: 50%; border: 2px dashed rgb(243 200 76 / .75); box-shadow: 0 0 24px rgb(79 179 106 / .35), inset 0 0 24px rgb(79 179 106 / .25); opacity: 0; animation: nv-wreath 900ms cubic-bezier(.16, 1, .3, 1) both; }
.nv-star { scale: 1.25; }
.nv-text { color: #f3c84c; font-size: clamp(15px, 4.2vw, 22px); text-transform: uppercase; letter-spacing: .06em; }
@keyframes nv-wreath { from { opacity: 0; transform: scale(.82) rotate(-12deg); } to { opacity: 1; transform: none; } }
.ov { position: absolute; left: 50%; top: 50%; width: 0; height: 0; --R: calc(var(--bd) + 14px); }
.ov-glow { position: absolute; left: 50%; top: 50%; width: 120vmin; height: 120vmin; margin: -60vmin 0 0 -60vmin; border-radius: 9999px; background: radial-gradient(closest-side, rgb(255 211 77 / .32), rgb(255 154 31 / .08) 55%, transparent); opacity: 0; animation: sc-in 900ms ease-out both; }
.ov-rays { position: absolute; left: 0; top: 0; width: 0; height: 0; animation: ov-turn 4.2s linear both; }
.ov-arm { position: absolute; left: -4px; top: -14px; width: 8px; height: 28px; transform: rotate(var(--a)) translateY(calc(-1 * var(--R) - 14px)); }
.ov-ray { display: block; width: 100%; height: 100%; border-radius: 9999px; background: linear-gradient(#fff3b0, #ffd34d 40%, #ff9a1f); box-shadow: 0 0 12px rgb(255 190 60 / .7); transform-origin: 50% 100%; transform: scaleY(0); animation: ov-grow 600ms cubic-bezier(.2, 1.4, .4, 1) both; }
.ov-count { position: absolute; left: 0; top: calc(var(--R) + 34px); translate: -50% 0; color: #ffd34d; font-size: 13px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; white-space: nowrap; }
.ov-wave { position: absolute; left: -10%; bottom: -1px; width: 120%; height: 12vh; transform: translateY(110%); animation: ov-rise 900ms cubic-bezier(.16, 1, .3, 1) both, ov-sway 1.4s ease-in-out 2 alternate; }
.ov-wave-1 { height: 8vh; }
@keyframes ov-turn { from { transform: rotate(-10deg); } to { transform: rotate(14deg); } }
@keyframes ov-grow { to { transform: scaleY(1); } }
@keyframes ov-rise { to { transform: translateY(0); } }
@keyframes ov-sway { from { translate: 0 0; } to { translate: 4% 0; } }
`;
