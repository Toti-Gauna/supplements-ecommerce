"use client";
import { CalendarClock, CreditCard, ShoppingBag, Wallet } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { LedPrice } from "@/components/atoms/Led";
import { GIFT_CARD_RULES } from "@/demo/engine/gift-cards";
import { formatARS } from "@/lib/money";

const POINTS = [
  { icon: ShoppingBag, text: "Elige lo que quiera: suplementos, equipamiento o un pack." },
  { icon: Wallet, text: "El saldo se descuenta en el checkout y lo que sobra queda para la próxima." },
  { icon: CalendarClock, text: `Vence a los ${GIFT_CARD_RULES.months} meses. Lo ve en Mi box, con su saldo.` },
];

/** Gift card con monto (R3b): la tarjeta de acero con el marcador y cómo se usa; "Armar la gift card" abre el armador. */
export function CardPick({ onPick }: { onPick: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
      <div className="led-dark floor relative overflow-hidden rounded-md p-7 text-on-night shadow-[var(--shadow-lift)] ring-1 ring-white/10 sm:p-9">
        <span aria-hidden="true" className="absolute -right-10 top-0 h-12 w-56 -skew-x-[30deg] bg-volt" />
        <CreditCard size={30} aria-hidden="true" className="text-volt" />
        <p className="eyebrow mt-6 text-night-muted">Gift card · desde {formatARS(GIFT_CARD_RULES.min)}</p>
        <div className="mt-3"><LedPrice amount={GIFT_CARD_RULES.presets[1]} motion="none" className="h-14 sm:h-16" signClassName="text-volt" /></div>
        <p className="mt-6 font-mono text-sm font-bold tracking-[0.2em] text-night-muted">GIFT-····-····</p>
      </div>
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-4xl uppercase italic leading-none">Que elija lo que quiera</h2>
        <ul className="flex flex-col gap-3">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm"><Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />{text}</li>
          ))}
        </ul>
        <Button size="lg" onClick={onPick} className="w-full sm:w-fit"><CreditCard size={18} aria-hidden="true" /> Armar la gift card</Button>
      </div>
    </div>
  );
}
