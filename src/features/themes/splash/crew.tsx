"use client";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { SceneCss, useDelay, vars } from "./kit";
import { Anchor, Burst, Letters, RigCss } from "./rig";

/**
 * Halloween, "Monster pump": relámpagos, murciélagos que cruzan arriba, el título en naranja y la calabaza musculosa
 * que sube desde abajo y saca bíceps dos veces.
 */
export function HalloweenScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="crew" css={CSS} />
      <span className="hw-flash" style={d(0.5, 2.2)} />
      {[0, 1, 2].map((i) => (
        <span key={i} data-sc className="hw-bat sc-tall" style={{ ...vars({ "--i": i }), ...d(0.4 + i * 0.45) }}>
          <span className="hw-flap" style={d(0.4 + i * 0.45)}><Decor kind="bat" className="h-full w-full" /></span>
        </span>
      ))}
      <Anchor s="0px" extra="4px">
        <p data-sc className="sc-above sc-tall hw-title font-display font-wide"><Letters text="Monster pump" at={1} /></p>
        <span className="sc-below sc-tall hw-glow" style={d(1.6)} />
        <span data-sc className="sc-below sc-tall hw-pumpkin" style={d(0.6, 1.65)}><Decor kind="muscle-pumpkin" className="h-full w-full" /></span>
      </Anchor>
    </>
  );
}

const PLATES: [string, number][] = [["#d6262f", 1], ["#2450c9", 0.86], ["#f2c018", 0.72]];

/**
 * Día del Padre, "no saltea piernas": abajo del logo se arma una barra olímpica (los discos entran por los costados,
 * van las trabas y la barra sube), arriba cae el trofeo con un brillo y aparece "Nuevo PR".
 */
export function FathersScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="crew" css={CSS} />
      <Anchor s="0px" extra="4px">
        <div data-sc className="dp-rack sc-tall">
          <div className="dp-lift" style={d(1.45)}>
            <span className="dp-shaft" style={d(0.3)} />
            {(["l", "r"] as const).flatMap((side) => PLATES.map(([c, h], i) => (
              <span key={`${side}${i}`} className={`dp-plate dp-${side}`} style={{ ...vars({ "--i": i, "--h": h, background: c }), ...d(0.55 + i * 0.15 + (side === "r" ? 0.05 : 0)) }} />
            )))}
            <span className="dp-collar dp-l" style={d(1.15)} /><span className="dp-collar dp-r" style={d(1.15)} />
          </div>
          <p className="dp-pr font-display font-wide"><Letters text="Nuevo PR" at={1.9} /></p>
        </div>
        <span data-sc className="sc-above sc-tall dp-trophy" style={d(1.6)}><Decor kind="trophy" className="h-full w-full" /></span>
        <Burst x="0px" y="calc(var(--ry) * -1 - 50px)" at={1.95} colors={["#ffcf5c", "#ffffff"]} n={14} r="60px" />
      </Anchor>
    </>
  );
}

/**
 * Día del Amigo, "compañero de gym": dos aros (ion y voltio) se cruzan alrededor del logo y giran en sentidos
 * opuestos, dos shakers llegan desde los costados y brindan abajo con un chispazo, y arriba los guantes chocan los puños.
 */
export function FriendsScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="crew" css={CSS} />
      <div className="da-rings">
        {[-1, 1].map((side) => <span key={side} className="da-ring" style={{ ...vars({ "--side": side }), ...d(0.3 + (side + 1) * 0.15) }} />)}
      </div>
      <Anchor s="0px" extra="4px">
        {[-1, 1].map((side) => (
          <span key={side} data-sc className="sc-below sc-tall da-shaker" style={{ ...vars({ "--side": side }), ...d(0.5) }}>
            <span className="da-tilt" style={d(1.05)}><Decor kind="shaker" className="h-full w-full" /></span>
          </span>
        ))}
        <Burst x="0px" y="calc(var(--bd) + 46px)" at={1.18} colors={["#c8ff2e", "#5ee8da", "#ffffff"]} n={14} r="52px" />
        <span data-sc className="sc-above sc-tall da-gloves" style={d(1.7)}><Decor kind="gloves" className="h-full w-full" /></span>
        <Burst x="0px" y="calc(var(--bd) * -1 - 70px)" at={1.95} colors={["#5ee8da", "#c8ff2e"]} n={12} r="54px" />
      </Anchor>
    </>
  );
}

const CSS = `
.hw-flash { position: absolute; inset: 0; background: radial-gradient(80% 60% at 50% 20%, rgb(220 200 255 / .5), transparent 70%); opacity: 0; animation: hw-flash 900ms linear both, hw-flash 700ms linear both; }
.hw-bat { position: absolute; left: 0; top: calc(9% + 36px + var(--i) * 40px); width: calc(46px - var(--i) * 8px); height: calc(46px - var(--i) * 8px); transform: translateX(-30vw); animation: hw-fly 2.6s cubic-bezier(.4, 0, .6, 1) both; }
.hw-flap { display: block; width: 100%; height: 100%; animation: hw-flap 260ms ease-in-out 10 alternate both; }
.hw-title { color: #ff8a1f; font-size: clamp(26px, 8vw, 52px); line-height: 1; text-transform: uppercase; text-shadow: 0 0 22px rgb(166 255 77 / .45); }
.hw-pumpkin { width: clamp(110px, 34vmin, 190px); height: clamp(110px, 34vmin, 190px); transform-origin: 50% 100%; transform: translateY(70vh); animation: hw-rise 900ms cubic-bezier(.2, 1.3, .4, 1) both, hw-flex 700ms ease-in-out both; }
.hw-glow { width: clamp(140px, 44vmin, 240px); height: clamp(140px, 44vmin, 240px); margin-top: -20px; border-radius: 9999px; background: radial-gradient(closest-side, rgb(255 138 31 / .45), transparent); opacity: 0; animation: hw-glow 1.2s ease-in-out 2 alternate both; }
@keyframes hw-flash { 0% { opacity: 0; } 8% { opacity: .9; } 16% { opacity: .15; } 26% { opacity: .6; } 42%, 100% { opacity: 0; } }
@keyframes hw-fly { 0% { transform: translate(-30vw, 0); } 50% { transform: translate(50vw, -14px); } 100% { transform: translate(130vw, 6px); } }
@keyframes hw-flap { from { transform: scaleY(1); } to { transform: scaleY(.55); } }
@keyframes hw-rise { to { transform: none; } }
@keyframes hw-flex { 0%, 100% { scale: 1; } 30% { scale: 1.12 1.06; } 55% { scale: 1; } 75% { scale: 1.08 1.04; } }
@keyframes hw-glow { from { opacity: .2; } to { opacity: 1; } }
.dp-rack { position: absolute; left: 0; top: calc(var(--ry) + 26px); translate: -50% 0; width: min(92vw, calc(var(--bw) * 2 + 140px)); --ph: clamp(52px, 15vmin, 84px); }
.dp-lift { position: relative; height: var(--ph); animation: dp-lift 700ms cubic-bezier(.3, 1.6, .5, 1) both; }
.dp-shaft { position: absolute; left: 0; right: 0; top: calc(50% - 4px); height: 8px; border-radius: 4px; background: linear-gradient(#f4f6f8, #9aa3ad 55%, #5d6672); transform: scaleX(0); animation: dp-in 600ms cubic-bezier(.16, 1, .3, 1) both; }
.dp-plate { position: absolute; top: calc(50% - var(--ph) * var(--h) / 2); width: calc(var(--ph) * .19); height: calc(var(--ph) * var(--h)); border-radius: 5px; box-shadow: inset 0 0 0 2px rgb(0 0 0 / .25), inset 3px 0 0 rgb(255 255 255 / .2); opacity: 0; animation: dp-load 520ms cubic-bezier(.2, 1.3, .4, 1) both; }
.dp-plate.dp-l { left: calc(5% + 12px + (2 - var(--i)) * var(--ph) * .22); --from: -60vw; }
.dp-plate.dp-r { right: calc(5% + 12px + (2 - var(--i)) * var(--ph) * .22); --from: 60vw; }
.dp-collar { position: absolute; top: calc(50% - 9px); width: 9px; height: 18px; border-radius: 3px; background: #c8ff2e; opacity: 0; animation: sc-pop 400ms ease-out both; }
.dp-collar.dp-l { left: 5%; }
.dp-collar.dp-r { right: 5%; }
.dp-pr { margin-top: 14px; color: #ffcf5c; font-size: clamp(18px, 5vw, 28px); text-align: center; text-transform: uppercase; }
.dp-trophy { width: clamp(56px, 16vmin, 92px); height: clamp(56px, 16vmin, 92px); opacity: 0; animation: dp-drop 700ms cubic-bezier(.3, 1.5, .5, 1) both; }
@keyframes dp-in { to { transform: scaleX(1); } }
@keyframes dp-load { from { opacity: 0; transform: translateX(var(--from)); } 30% { opacity: 1; } to { opacity: 1; transform: none; } }
@keyframes dp-lift { 0% { transform: none; } 60% { transform: translateY(-14px); } 100% { transform: translateY(-8px); } }
@keyframes dp-drop { from { opacity: 0; transform: translateY(-40vh); } to { opacity: 1; transform: none; } }
.da-rings { position: absolute; left: 50%; top: 50%; width: 0; height: 0; --R: calc(var(--bd) + 22px); }
.da-ring { position: absolute; left: calc(var(--side) * 12px - var(--R)); top: calc(-1 * var(--R)); width: calc(var(--R) * 2); height: calc(var(--R) * 2); border-radius: 9999px; border: 2px dashed #5ee8da; opacity: 0; animation: sc-in 600ms ease-out both, da-spin 4.2s linear both; }
.da-ring + .da-ring { border-color: #c8ff2e; }
.da-shaker.sc-below { top: calc(var(--bd) + 34px); }
.da-gloves.sc-above { bottom: calc(var(--bd) + 34px); }
@keyframes da-spin { to { rotate: calc(var(--side) * 50deg); } }
.da-shaker { width: clamp(56px, 16vmin, 96px); height: clamp(56px, 16vmin, 96px); margin-left: calc(var(--side) * clamp(56px, 16vmin, 96px) * .5); transform: translateX(calc(var(--side) * 60vw)); animation: da-in 650ms cubic-bezier(.2, 1, .4, 1) both; }
.da-tilt { display: block; width: 100%; height: 100%; transform-origin: 50% 100%; rotate: calc(var(--side) * -8deg); animation: da-clink 520ms ease-in-out both; }
.da-gloves { width: clamp(64px, 18vmin, 104px); height: clamp(64px, 18vmin, 104px); opacity: 0; animation: sc-pop 600ms cubic-bezier(.2, 1.5, .4, 1) both; }
@keyframes da-in { to { transform: none; } }
@keyframes da-clink { 0% { transform: none; } 40% { transform: rotate(calc(var(--side) * -22deg)); } 100% { transform: none; } }
`;
