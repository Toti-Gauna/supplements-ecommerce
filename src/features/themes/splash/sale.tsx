"use client";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { SceneCss, useDelay, vars, type SceneProps } from "./kit";
import { Anchor, Burst, Letters, point, RigCss, Strip } from "./rig";

const TAGS = [-150, -115, -65, -30];

/**
 * Black Friday: un haz de voltio barre la pantalla, caen etiquetas colgadas de sus hilos alrededor del logo y la
 * oferta se estampa abajo con un sacudón y una onda expansiva. A los costados, las bolsas.
 */
export function BlackFridayScene({ offer }: SceneProps) {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="sale" css={CSS} />
      <span className="bf-sweep" style={d(0.25, 2.5)} />
      <div className="bf-shake" style={d(1.62)}>
        <Anchor s="40px" shape="ellipse">
          {TAGS.map((deg, i) => {
            const [x, y] = point(deg, "ellipse");
            return (
              <span key={deg} data-sc className="sc-piece bf-tag" style={{ ...vars({ "--x": `calc(var(--rx) * ${x})`, "--y": `calc(var(--ry) * ${y})` }), ...d(0.45 + i * 0.12, 1.2 + i * 0.12) }}>
                <Decor kind="tag" className="h-full w-full" />
              </span>
            );
          })}
          {[150, 30].map((deg, i) => {
            const [x, y] = point(deg, "ellipse");
            return <span key={deg} data-sc className="sc-piece sc-pop" style={{ ...vars({ "--x": `calc(var(--rx) * ${x})`, "--y": `calc(var(--ry) * ${y})` }), ...d(1.95 + i * 0.1) }}><Decor kind="bag" className="h-full w-full" /></span>;
          })}
        </Anchor>
        <Anchor s="0px" extra="6px">
          <p data-sc className="sc-below bf-stamp font-display font-wide" style={d(1.4)}>{offer ?? "Black Friday"}</p>
          <span className="bf-wave" style={d(1.55)} />
        </Anchor>
      </div>
    </>
  );
}

const CLOCK = ["72:00:00", "71:59:59", "71:59:58", "71:59:57"];

/**
 * Hot Sale: una fila de llamas crece desde el pie de la pantalla, la oferta arde arriba del logo y abajo corre el
 * reloj de las 72 horas.
 */
export function HotSaleScene({ offer }: SceneProps) {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="sale" css={CSS} />
      <span className="hs-heat" style={d(0.2)} />
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} data-sc className="hs-flame" style={{ ...vars({ left: `${(i + 0.5) * (100 / 7)}%`, "--k": [0.8, 1.1, 0.9, 1.3, 0.9, 1.1, 0.8][i]! }), ...d(0.3 + Math.abs(i - 3) * 0.12, 1.2 + i * 0.07) }}>
          <Decor kind="flame" className="h-full w-full" />
        </span>
      ))}
      <Anchor s="0px" extra="4px">
        <p data-sc className="sc-above sc-tall hs-offer font-display font-wide"><Letters text={offer ?? "Hot Sale"} at={0.9} step={0.06} /></p>
        <p data-sc className="sc-below sc-tall hs-clock font-lab"><Strip values={CLOCK} at={0.8} dur={3} /></p>
        <Burst x="0px" y="calc(var(--ry) * -1 - 40px)" at={1.5} colors={["#ffd34d", "#ff8a3c", "#ffffff"]} r="64px" n={14} />
      </Anchor>
    </>
  );
}

const CSS = `
.bf-sweep { position: absolute; left: -60%; top: -20%; width: 45%; height: 140%; background: linear-gradient(90deg, transparent, rgb(200 255 46 / .18), transparent); transform: translateX(0) rotate(18deg); opacity: 0; animation: bf-sweep 1.1s ease-in-out both; }
.bf-shake { position: absolute; inset: 0; animation: bf-shake 320ms steps(2) both; }
.bf-tag { transform-origin: 50% 0; opacity: 0; animation: bf-drop 800ms cubic-bezier(.3, 1.4, .5, 1) both, bf-swing 700ms ease-in-out 2 alternate; }
.bf-tag::before { content: ""; position: absolute; left: 50%; bottom: 82%; width: 1px; height: 60vh; background: linear-gradient(transparent, rgb(255 255 255 / .4)); }
.bf-stamp { color: #c8ff2e; font-size: clamp(28px, 9vw, 60px); line-height: 1; text-transform: uppercase; text-shadow: 0 0 30px rgb(200 255 46 / .45); opacity: 0; animation: bf-stamp 420ms cubic-bezier(.5, 0, .3, 1.3) both; }
.bf-wave { position: absolute; left: -120px; top: calc(var(--ry) + 4px); width: 240px; height: 70px; border-radius: 50%; border: 2px solid #c8ff2e; opacity: 0; animation: bf-wave 800ms ease-out both; }
@keyframes bf-sweep { 0% { opacity: 0; transform: translateX(0) rotate(18deg); } 20%, 80% { opacity: 1; } 100% { opacity: 0; transform: translateX(380%) rotate(18deg); } }
@keyframes bf-shake { 0% { transform: translate(3px, -2px); } 50% { transform: translate(-3px, 2px); } 100% { transform: none; } }
@keyframes bf-drop { from { opacity: 0; transform: translateY(-60vh); } to { opacity: 1; transform: none; } }
@keyframes bf-swing { from { rotate: 0deg; } to { rotate: 7deg; } }
@keyframes bf-stamp { from { opacity: 0; transform: scale(2.4); } to { opacity: 1; transform: none; } }
@keyframes bf-wave { 0% { opacity: .9; transform: scale(.6); } 100% { opacity: 0; transform: scale(1.8); } }
.hs-heat { position: absolute; inset-inline: -10%; bottom: -10%; height: 55%; background: radial-gradient(60% 70% at 50% 100%, rgb(255 110 40 / .5), transparent 70%); opacity: 0; animation: sc-in 1s ease-out both; }
.hs-flame { position: absolute; bottom: -1.5vh; width: calc(clamp(48px, 15vmin, 120px) * var(--k)); height: calc(clamp(48px, 15vmin, 120px) * var(--k)); translate: -50% 0; transform-origin: 50% 100%; transform: scaleY(0); animation: hs-grow 700ms cubic-bezier(.2, 1.3, .4, 1) both, hs-flicker 260ms ease-in-out 6 alternate; }
.hs-offer { font-size: clamp(30px, 10vw, 64px); line-height: 1.05; text-transform: uppercase; filter: drop-shadow(0 0 18px rgb(255 110 40 / .55)); }
.hs-offer .sc-letters > span { background: linear-gradient(#fff6c2, #ffd34d 45%, #ff5a1f); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hs-clock { color: #ffd34d; font-size: 15px; font-weight: 800; letter-spacing: .18em; }
@keyframes hs-grow { to { transform: scaleY(1); } }
@keyframes hs-flicker { from { scale: 1 1; } to { scale: 1.06 .94; } }
`;
