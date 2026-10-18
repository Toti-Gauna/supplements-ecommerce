import type { Metadata } from "next";
import { PIECE_IDS } from "@/trailer/pieces/ids";
import { eclipseFontVars } from "@/trailer/eclipse/fonts";
import { TrailerHost } from "@/trailer/TrailerHost";

export const dynamicParams = false;

export function generateStaticParams() {
  return PIECE_IDS.map((pieza) => ({ pieza }));
}

export const metadata: Metadata = { title: "Trailer", robots: { index: false, follow: false } };

/** Trailer en pantalla completa (`?t=` congela un cuadro, `?ratio=9x16` vertical, `?export=1` para grabar). */
export default async function TrailerPage({ params }: { params: Promise<{ pieza: string }> }) {
  const { pieza } = await params;
  return <div className={eclipseFontVars}><TrailerHost pieza={pieza} /></div>;
}
