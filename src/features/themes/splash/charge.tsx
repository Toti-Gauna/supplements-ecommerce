"use client";
import { Decor, type DecorKind } from "@/components/illustrations/seasonal/Decor";
import { SceneCss, useDelay, vars } from "./kit";
import { Anchor, point, Ring, RigCss, Strip } from "./rig";

const PCT = Array.from({ length: 11 }, (_, i) => `${i * 10}%`);

/**
 * Día de la Madre, "regalale energía": una batería en anillo (28 celdas) se carga alrededor del logo, destella al
 * 100 % y florecen flores y corazones con pulso. Abajo, la lectura de la carga.
 */
export function MothersScene() {
  const d = useDelay();
  const cells = 28;
  return (
    <>
      <RigCss /><SceneCss id="charge" css={CSS} />
      <Anchor s="12px" extra="2px">
        <span className="md-wave" style={d(2.15)} />
        {Array.from({ length: cells }, (_, i) => {
          const deg = -90 + (i * 360) / cells;
          const [x, y] = point(deg, "frame");
          return <span key={i} data-sc className="sc-piece md-cell" style={{ ...vars({ "--x": `calc(var(--rx) * ${x})`, "--y": `calc(var(--ry) * ${y})`, rotate: `${deg + 90}deg` }), ...d(0.35 + i * 0.06, 2.15) }} />;
        })}
      </Anchor>
      <Ring kinds={["flower", "pulse-heart"]} count={8} from={-67.5} start={2.2} step={0.07} extra="16px">
        <p className="sc-below sc-tall md-read font-lab">Carga de amor · <Strip values={PCT} at={0.35} dur={1.7} /></p>
      </Ring>
    </>
  );
}

const ROW: DecorKind[] = ["kettlebell", "calendar", "sneaker"];

/**
 * Vuelta al gym: el bisel de un cronómetro alrededor del logo; las 60 marcas se prenden mientras la aguja de luz da
 * la vuelta completa, un destello marca el arranque y abajo aparecen la pesa rusa, el lunes y las zapatillas.
 */
export function BackToGymScene() {
  const d = useDelay();
  return (
    <>
      <RigCss /><SceneCss id="charge" css={CSS} />
      <div className="vg">
        <span className="vg-ping" style={d(2.35)} />
        {Array.from({ length: 60 }, (_, i) => (
          <span key={i} data-sc className={`vg-tick ${i % 5 ? "" : "vg-major"}`} style={{ ...vars({ "--a": `${i * 6}deg` }), ...d(0.35 + i * 0.033) }} />
        ))}
        <span className="vg-sweep" style={d(0.35)}><span data-sc className="vg-dot" /></span>
        <Anchor s="44px" className="sc-tall">
          {ROW.map((kind, i) => (
            <span key={kind} data-sc className="sc-piece sc-pop" style={{ ...vars({ "--x": `calc(var(--s) * ${(i - 1) * 1.45})`, "--y": "calc(var(--R) + 26px + var(--s) / 2)" }), ...d(2.4 + i * 0.12) }}>
              <Decor kind={kind} className="h-full w-full drop-shadow-[0_8px_14px_rgb(0_0_0/0.45)]" />
            </span>
          ))}
        </Anchor>
      </div>
    </>
  );
}

const CSS = `
.md-cell { border-radius: 3px; scale: .5 1; background: #ff8fb6; box-shadow: 0 0 10px #ff6fa0; opacity: .14; animation: md-on 220ms ease-out both, md-full 700ms ease-out both; }
.md-wave { position: absolute; left: calc(-1 * var(--rx)); top: calc(-1 * var(--ry)); width: calc(var(--rx) * 2); height: calc(var(--ry) * 2); border-radius: 36%; border: 2px solid #ffd6e7; opacity: 0; animation: md-wave 1s ease-out both; }
.md-read { color: #ffd6e7; font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
@keyframes md-on { to { opacity: 1; } }
@keyframes md-full { 30% { transform: scale(1.6); } }
@keyframes md-wave { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(1.35); } }
.vg { position: absolute; left: 50%; top: 50%; width: 0; height: 0; --R: calc(var(--bd) + 18px); }
.vg .sc-ring { left: 0; top: 0; }
.vg-tick { position: absolute; left: -1px; top: -4px; width: 2px; height: 8px; border-radius: 2px; background: #c8ff2e; box-shadow: 0 0 6px rgb(200 255 46 / .7); opacity: .16; transform: rotate(var(--a)) translateY(calc(-1 * var(--R))); animation: vg-on 160ms ease-out both; }
.vg-tick.vg-major { left: -1.5px; top: -7px; width: 3px; height: 14px; }
.vg-sweep { position: absolute; left: 0; top: 0; width: 0; height: 0; animation: vg-spin 1.95s cubic-bezier(.5, 0, .3, 1) both; }
.vg-dot { position: absolute; left: -6px; top: calc(-1 * var(--R) - 6px); width: 12px; height: 12px; border-radius: 9999px; background: #f4ffd6; box-shadow: 0 0 14px 5px rgb(200 255 46 / .75); }
.vg-ping { position: absolute; left: calc(-1 * var(--R)); top: calc(-1 * var(--R)); width: calc(var(--R) * 2); height: calc(var(--R) * 2); border-radius: 9999px; border: 2px solid #c8ff2e; opacity: 0; animation: vg-ping 900ms ease-out both; }
@keyframes vg-on { to { opacity: 1; } }
@keyframes vg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes vg-ping { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(1.3); } }
`;
