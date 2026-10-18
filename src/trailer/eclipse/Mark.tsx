import { EC, FONT } from "./tokens";

/** Marca de sección de Eclipse: "08 ——— ● CONDICIONES" (número en mono, regla, punto de corona y rótulo). */
export function SectionMark({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  const ink = dark ? EC.mist : EC.muted;
  return (
    <p data-t="mark" className="flex items-center gap-5 uppercase" style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.22em", color: ink }}>
      <span>{n}</span>
      <span data-t="mark-rule" className="block h-px w-24 origin-left" style={{ background: ink }} />
      <span className="block size-3 rounded-full" style={{ background: dark ? EC.corona : EC.deep }} />
      <span>{label}</span>
    </p>
  );
}

/** Titular serif de Eclipse con la parte final en itálica de corona ("Probalo *en vivo*."). */
export function SerifTitle({ text, italic, size, dark = false }: { text: string; italic: string; size: number; dark?: boolean }) {
  return (
    <h2 data-t="title" className="leading-[0.95]" style={{ fontFamily: FONT.serif, fontSize: size, color: dark ? EC.dawn : EC.ink, letterSpacing: "-0.01em" }}>
      <span data-t="title-line" className="block">{text}</span>
      <span data-t="title-line" className="block italic" style={{ color: dark ? EC.corona : EC.deep }}>{italic}</span>
    </h2>
  );
}
