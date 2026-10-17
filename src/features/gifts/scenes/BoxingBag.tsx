import { useId } from "react";
import { bagColors, type BagDecor } from "./bag-colors";
import { BAG_CSS } from "./bag-css";
import { BagDefs, Cap, Cavity, Chain, FrontStraps, Leather, PANEL, SEAMS, SeamSlit, Skin } from "./bag-parts";
import { RevealGlow, TubReveal } from "./bag-reveal";
import { ANO_NUEVO, DIA_DE_LA_MADRE, DIA_DEL_AMIGO, DIA_DEL_PADRE, NAVIDAD, SAN_VALENTIN } from "./details-gifts";
import { BLACK_FRIDAY, CYBER_MONDAY, HALLOWEEN, HOT_SALE, OPERACION_VERANO, BRAND_BAG, VUELTA_AL_GYM } from "./details-sales";
import { ChalkDust, KIT_CSS, SceneStyle } from "./kit";
import type { GiftSceneProps } from "./types";
import { bagVariant, type BagDetail } from "./variants";
import { brand } from "@/config/brand";

const DETAILS: Record<BagDetail, BagDecor> = {
  volta: BRAND_BAG, navidad: NAVIDAD, "ano-nuevo": ANO_NUEVO, "san-valentin": SAN_VALENTIN, "dia-de-la-madre": DIA_DE_LA_MADRE,
  "dia-del-padre": DIA_DEL_PADRE, "dia-del-amigo": DIA_DEL_AMIGO, halloween: HALLOWEEN, "black-friday": BLACK_FRIDAY,
  "cyber-monday": CYBER_MONDAY, "hot-sale": HOT_SALE, "vuelta-al-gym": VUELTA_AL_GYM, "operacion-verano": OPERACION_VERANO,
};

/**
 * Recorte vertical del lienzo de 300: la bolsa cuelga y llena el alto (lo ancho, guantes y etiqueta, entra igual).
 * Proporción 11:15, la misma de la caja del escenario (`GiftOpener`).
 */
const VIEW = { x: 40, y: -8, w: 220, h: 300 };
/** Dónde pega cada golpe: cerca del centro del paño, nunca dos veces en el mismo lugar. */
const IMPACTS = [{ x: 150, y: 168 }, { x: 138, y: 147 }, { x: 162, y: 183 }, { x: 141, y: 189 }, { x: 156, y: 156 }];
/** Un punto del lienzo, en % de la escena (para las partículas, que van por encima en HTML). */
const pct = (p: { x: number; y: number }) => ({ x: ((p.x - VIEW.x) / VIEW.w) * 100, y: ((p.y - VIEW.y) / VIEW.h) * 100 });
/** Cuánto se abrió la costura `i`: la más nueva a medias y las anteriores cada vez más; al abrir, todas del todo. */
const seamOpening = (i: number, seams: number, opened: boolean) => (opened ? 1 : Math.min(1, 0.55 + (seams - 1 - i) * 0.15));

/**
 * Apertura del regalo: una bolsa de boxeo VOLTA que cuelga de su cadena, vestida según la ocasión. Cada golpe la
 * balancea, marca el impacto, larga polvo de tiza y abre una costura con luz adentro; en el último se rompe el paño
 * del frente y sale el pote iluminado. Solo dibuja: el escenario maneja los toques, el sonido y la accesibilidad.
 */
export default function BoxingBag({ occasion, hits, total, opened, reduce }: GiftSceneProps) {
  const uid = `bk${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const c = bagColors(occasion);
  const variant = bagVariant(occasion);
  const { Body, Top } = DETAILS[variant.detail];
  const body = Body && <Body c={c} uid={uid} />;
  const charge = opened ? 1 : hits / total;
  const seams = opened ? SEAMS.length : Math.min(hits, SEAMS.length);
  const swing = hits > 0 && !reduce ? `bk-swing-${hits % 2 ? "r" : "l"}` : "";
  const impact = IMPACTS[(Math.max(hits, 1) - 1) % IMPACTS.length]!;
  const dust = pct(opened ? { x: 150, y: 170 } : impact);
  // Las costuras abiertas (al abrir, caen con el paño). La más nueva larga su arco eléctrico.
  const slits = SEAMS.slice(0, seams).map((s, i) => (
    <SeamSlit key={i} seam={s} open={seamOpening(i, seams, opened)} fresh={!opened && !reduce && i === seams - 1} uid={uid} c={c} />
  ));
  return (
    <div className="gift-scene relative h-full w-full select-none" data-bag={variant.detail}>
      <SceneStyle id="bag" css={KIT_CSS + BAG_CSS} />
      <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <BagDefs uid={uid} c={c} />
        <g className="bk-glow" style={{ transform: `scale(${0.6 + charge * 0.4})`, opacity: 0.35 + charge * 0.5 }}>
          <circle cx="150" cy="170" r="135" fill={`url(#${uid}-glow)`} />
        </g>
        {opened && <RevealGlow uid={uid} />}
        <ellipse className={`bk-shadow ${swing}`} cx="150" cy="286" rx="48" ry="6" fill="#000" opacity=".5" />
        <g className={hits === 0 && !reduce ? "bk-hint" : undefined}>
          <g className={`bk-bag ${swing}`}>
            <Chain uid={uid} />
            <Skin uid={uid} c={c}>{body}</Skin>
            {opened && <Cavity uid={uid} c={c} />}
            {opened ? (
              <g className="bk-panel">
                <svg x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} viewBox={`${PANEL.x} ${PANEL.y} ${PANEL.w} ${PANEL.h}`} overflow="hidden">
                  <Leather uid={uid}>{body}</Leather>
                </svg>
                {slits}
              </g>
            ) : slits}
            {hits > 0 && !opened && !reduce && (
              <ellipse key={hits} className="bk-dent" cx={impact.x} cy={impact.y} rx="17" ry="21" fill={`url(#${uid}-dent)`} />
            )}
            <Cap c={c} />
            {Top && <Top c={c} uid={uid} />}
            <FrontStraps uid={uid} />
          </g>
        </g>
        {opened && <TubReveal c={c} />}
      </svg>
      {!reduce && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {hits > 0 && !opened && <ChalkDust key={hits} seed={hits} x={dust.x} y={dust.y} />}
          {opened && <ChalkDust seed={42} x={dust.x} y={dust.y} count={22} spread={1.7} sparks={[c.accent, "#ffffff", brand.signature.volt]} />}
        </div>
      )}
    </div>
  );
}
