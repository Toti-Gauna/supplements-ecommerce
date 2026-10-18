import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { BOOKS } from "./book";
import { SectionMark, SerifTitle } from "./Mark";
import { fmtArs, fmtUsd, type PriceRow } from "./pricing";
import { EC, FONT } from "./tokens";

export interface PricesProps { book: string; section: string; n: string }

function Row({ row, tall, dense }: { row: PriceRow; tall: boolean; dense: boolean }) {
  return (
    <li data-t="row" className="flex items-start justify-between gap-10 border-b" style={{ borderColor: EC.rulelight, paddingBlock: dense ? (tall ? 20 : 12) : tall ? 26 : 20 }}>
      <div className="min-w-0">
        <p style={{ fontFamily: FONT.sans, fontSize: tall ? 34 : 30, fontWeight: 500, color: EC.ink }}>{row.name}</p>
        {row.detail && !(dense && !tall) && <p className="mt-1 max-w-[760px]" style={{ fontFamily: FONT.sans, fontSize: tall ? 23 : 20, lineHeight: 1.35, color: EC.muted }}>{row.detail}</p>}
        {row.tag && <p className="mt-2 uppercase" style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: "0.16em", color: EC.deep }}>{row.tag}</p>}
      </div>
      {row.price && (
        <div className="shrink-0 text-right tabular-nums">
          <p style={{ fontFamily: FONT.mono, fontSize: tall ? 46 : 44, fontWeight: 500, color: row.credit ? EC.deep : EC.ink }}>{fmtArs(row.price.ars)}{row.unit === "por mes" && <span style={{ fontSize: 22, color: EC.muted }}> /mes</span>}</p>
          <p style={{ fontFamily: FONT.mono, fontSize: 20, color: EC.muted }}>{row.price.usd < 0 ? "−" : ""}{fmtUsd(Math.abs(row.price.usd))}{row.unit === "único" ? " · pago único" : ""}</p>
        </div>
      )}
    </li>
  );
}

/**
 * Una página del libro de precios de Eclipse (genérica: `book` + `section` del libro armado en `book.ts`). Fondo
 * amanecer, marca de sección, titular serif y filas tipo libro contable con pesos grandes y el dólar debajo. ~4 s.
 */
export const eclipsePrices = defineRecipe<PricesProps>({
  id: "eclipse-prices",
  Component: ({ props, ratio }) => {
    const book = BOOKS[props.book]!;
    const s = book.sections.find((x) => x.id === props.section)!;
    const tall = ratio === "9x16";
    return (
      <div className={`absolute inset-0 flex ${tall ? "flex-col gap-14 px-[90px] pt-[200px]" : "gap-24 px-[150px] pt-[130px]"}`} style={{ background: EC.dawn }}>
        <div className={tall ? "" : "w-[640px] shrink-0"}>
          <SectionMark n={props.n} label={s.eyebrow} />
          <div className="mt-10"><SerifTitle text={s.title} italic={s.italic} size={tall ? 150 : 128} /></div>
          {s.note && <p data-t="note" className="mt-10 max-w-[560px] uppercase" style={{ fontFamily: FONT.mono, fontSize: 19, lineHeight: 1.6, letterSpacing: "0.12em", color: EC.muted }}>{s.note}</p>}
        </div>
        <ul data-t="rows" className="min-w-0 flex-1 border-t" style={{ borderColor: EC.ink }}>
          {s.rows.map((row, i) => <Row key={i} row={row} tall={tall} dense={s.rows.length > (tall ? 4 : 5)} />)}
        </ul>
        <p className="absolute uppercase" style={{ left: tall ? 90 : 150, bottom: tall ? 90 : 60, fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.18em", color: EC.muted }}>
          {book.product} · Eclipse · tarifario {book.version.slice(0, 10)} · dólar a $ {book.rate.toLocaleString("es-AR")}
        </p>
      </div>
    );
  },
  build: ({ q }) => {
    const tl = gsap.timeline({ defaults: { ease: "trl.expo" } });
    const one = (sel: string) => q(`[data-t="${sel}"]`);
    tl.fromTo(one("mark"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.05);
    tl.fromTo(one("mark-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.1);
    tl.fromTo(one("title-line"), { autoAlpha: 0, yPercent: 40 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.12 }, 0.15);
    tl.fromTo(one("rows"), { borderTopColor: "rgba(17,17,20,0)" }, { borderTopColor: EC.ink, duration: 0.6 }, 0.3);
    tl.fromTo(one("row"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.11 }, 0.4);
    tl.fromTo(one("note"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.9);
    return tl;
  },
});
