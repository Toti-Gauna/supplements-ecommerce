"use client";
import { SceneCss, useDelay, vars, type SceneProps } from "./kit";
import { Anchor, RigCss } from "./rig";

const ACROSS = 9;
const SIDE = 5;

/**
 * CyberMonday, "overclock": el logo queda adentro de un chip. Se dibuja el borde, salen las patitas una por una, las
 * pistas del circuito corren hasta los bordes con paquetes de datos, y abajo la oferta entra con un glitch de color.
 */
export function CyberScene({ offer }: SceneProps) {
  const d = useDelay();
  const label = offer ?? "CyberMonday";
  return (
    <>
      <RigCss /><SceneCss id="cyber" css={CSS} />
      <div className="cy">
        <span className="cy-frame" style={d(0.3)} />
        {(["top", "bottom"] as const).flatMap((edge) => Array.from({ length: ACROSS }, (_, i) => (
          <span key={`${edge}${i}`} data-sc className={`cy-pin cy-${edge}`} style={{ ...vars({ "--p": (i + 0.5) / ACROSS }), ...d(0.45 + i * 0.05 + (edge === "bottom" ? 0.2 : 0)) }} />
        )))}
        {(["left", "right"] as const).flatMap((edge) => Array.from({ length: SIDE }, (_, i) => (
          <span key={`${edge}${i}`} data-sc className={`cy-trace cy-${edge}`} style={{ ...vars({ "--p": (i + 0.5) / SIDE }), ...d(0.85 + i * 0.07) }}>
            <i style={d(1.3 + i * 0.15 + (edge === "left" ? 0.08 : 0))} />
          </span>
        )))}
        <Anchor s="0px" extra="22px" className="cy-anchor">
          <p data-sc className="sc-below cy-offer font-display font-wide" style={d(1.4)}>
            <span className="cy-g cy-g1" style={d(1.4)}>{label}</span><span className="cy-g cy-g2" style={d(1.4)}>{label}</span><span className="cy-base">{label}</span>
          </p>
        </Anchor>
      </div>
    </>
  );
}

const CSS = `
.cy { position: absolute; left: 50%; top: 50%; width: 0; height: 0; --fw: calc(var(--bw) + 14px); --fh: calc(var(--bh) + 14px); }
.cy .cy-anchor { left: 0; top: 0; }
.cy-frame { position: absolute; left: calc(-1 * var(--fw)); top: calc(-1 * var(--fh)); width: calc(var(--fw) * 2); height: calc(var(--fh) * 2); border-radius: 14px; border: 1.5px solid #3ff0e0; box-shadow: 0 0 22px rgb(63 240 224 / .35), inset 0 0 22px rgb(63 240 224 / .18); opacity: 0; animation: cy-frame 700ms cubic-bezier(.16, 1, .3, 1) both; }
.cy-pin { position: absolute; width: 4px; height: 12px; border-radius: 2px; background: #3ff0e0; box-shadow: 0 0 8px rgb(63 240 224 / .8); left: calc(-1 * var(--fw) + var(--fw) * 2 * var(--p) - 2px); transform: scaleY(0); animation: cy-pin 260ms ease-out both; }
.cy-top { top: calc(-1 * var(--fh) - 15px); transform-origin: 50% 100%; }
.cy-bottom { top: calc(var(--fh) + 3px); transform-origin: 50% 0; }
.cy-trace { position: absolute; top: calc(-1 * var(--fh) + var(--fh) * 2 * var(--p)); height: 1.5px; width: 50vw; overflow: hidden; transform: scaleX(0); animation: cy-trace 500ms ease-out both; }
.cy-right { left: calc(var(--fw) + 3px); transform-origin: 0 50%; background: linear-gradient(90deg, #3ff0e0, rgb(63 240 224 / .1)); }
.cy-left { right: calc(var(--fw) + 3px); transform-origin: 100% 50%; background: linear-gradient(270deg, #3ff0e0, rgb(63 240 224 / .1)); }
.cy-trace i { position: absolute; top: -1px; width: 18px; height: 3.5px; border-radius: 2px; background: #ff4fd8; box-shadow: 0 0 10px #ff4fd8; opacity: 0; animation: cy-packet 900ms linear 2 both; }
.cy-right i { left: 0; }
.cy-left i { right: 0; animation-name: cy-packet-l; }
.cy-offer { position: absolute; font-size: clamp(28px, 9vw, 58px); line-height: 1; text-transform: uppercase; opacity: 0; animation: sc-in 300ms steps(3) both; }
.cy-base { position: relative; color: #e6f6fa; text-shadow: 0 0 24px rgb(63 240 224 / .55); }
.cy-g { position: absolute; left: 0; top: 0; opacity: .8; animation: cy-glitch 600ms steps(6) both; }
.cy-g1 { color: #3ff0e0; }
.cy-g2 { color: #ff4fd8; animation-name: cy-glitch2; }
@keyframes cy-frame { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }
@keyframes cy-pin { to { transform: scaleY(1); } }
@keyframes cy-trace { to { transform: scaleX(1); } }
@keyframes cy-packet { 0% { opacity: 0; transform: translateX(0); } 10% { opacity: 1; } 100% { opacity: 0; transform: translateX(48vw); } }
@keyframes cy-packet-l { 0% { opacity: 0; transform: translateX(0); } 10% { opacity: 1; } 100% { opacity: 0; transform: translateX(-48vw); } }
@keyframes cy-glitch { 0% { transform: translate(-6px, 1px); } 20% { transform: translate(5px, -2px); } 40% { transform: translate(-3px, 2px); } 60% { transform: translate(4px, 0); } 80% { transform: translate(-2px, -1px); } 100% { transform: translate(0, 0); opacity: 0; } }
@keyframes cy-glitch2 { 0% { transform: translate(6px, -1px); } 20% { transform: translate(-5px, 2px); } 40% { transform: translate(3px, -2px); } 60% { transform: translate(-4px, 0); } 80% { transform: translate(2px, 1px); } 100% { transform: translate(0, 0); opacity: 0; } }
`;
