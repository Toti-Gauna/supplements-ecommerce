"use client";
import { PackageOpen, RotateCcw, SlidersHorizontal } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { packCartLines, quotePack } from "@/demo/engine/packs";
import { programPack, programPerDay } from "@/demo/engine/program";
import type { QuizResult } from "@/demo/engine/quiz";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { PackBuyPanel } from "../packs/PackBuyPanel";

const PROGRAM_TEXTS = { region: "Comprar tu programa", eyebrow: "Tu programa · primera entrega", buy: "Comprar una vez" };

interface Props {
  result: QuizResult;
  /** `/crear/?objetivo=…&stack=…&deporte=…`: el armador abre con este estante. */
  builderHref: string;
  onRestart: () => void;
}

/** Sin programa (el quiz no llegó a dos suplementos): el pack de la tienda para ese deporte, o todos los packs. */
function NoProgram({ result }: { result: QuizResult }) {
  const pack = useDemoData((d) => d.packs?.find((p) => p.id === result.sport?.packId && p.active !== false));
  return (
    <section aria-labelledby="quiz-no-program" className="flex flex-col gap-3 border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <PackageOpen size={26} aria-hidden="true" className="text-volt-ink" />
      <h2 id="quiz-no-program" className="font-display text-2xl leading-tight">Esta vez no armamos un programa mensual</h2>
      <p className="text-sm text-muted">Con tus respuestas encontramos menos de dos suplementos con stock. {pack ? `El ${pack.name} está pensado para ${result.sport!.name.toLowerCase()}.` : "Mirá los packs armados: tienen el mismo descuento."}</p>
      <ButtonLink href={pack ? `/packs/?pack=${pack.id}` : "/packs/"} className="w-full">{pack ? `Ver el ${pack.name}` : "Ver los packs"}</ButtonLink>
    </section>
  );
}

/**
 * La compra del resultado: "Tu programa" (`programPack`) como cualquier pack, con el precio primero y las dos formas de
 * llevarlo (una vez o todos los meses, con el día de entrega). Ambas lo ponen en el carrito como pack a medida y lo
 * abren. Debajo, editarlo en el armador o empezar de nuevo.
 */
export function QuizProgramPanel({ result, builderHref, onRestart }: Props) {
  const addPack = useCart((s) => s.addPack);
  const openCart = useUi((s) => s.openCart);
  const pack = programPack(result);
  const quote = pack ? quotePack(pack) : null;
  const buy = (monthlyDay?: number) => {
    if (!pack || !quote?.available) return;
    addPack(pack.id, packCartLines(quote, monthlyDay), pack);
    openCart();
  };
  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24">
      {quote ? <PackBuyPanel quote={quote} onBuy={buy} perDay={programPerDay(quote)} texts={PROGRAM_TEXTS} /> : <NoProgram result={result} />}
      <ButtonLink href={builderHref} variant="secondary" className="w-full"><SlidersHorizontal size={17} aria-hidden="true" />Editarlo en el armador</ButtonLink>
      <button type="button" onClick={onRestart} className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-muted underline-offset-4 hover:text-ink hover:underline">
        <RotateCcw size={15} aria-hidden="true" />Hacer el quiz de nuevo
      </button>
    </div>
  );
}
