import { Led } from "@/components/atoms/Led";
import type { DropDiscount as Discount } from "@/demo/engine/campaign-drop";
import { cn } from "@/lib/cn";
import s from "./campaign.module.css";

/**
 * El descuento de la campaña como número de marcador, con la luz de la fecha: "30 %" o "$ 5.000". Sin número (envío
 * gratis) va en la display. `hidden`: la sala de espera lo muestra apagado ("--"), sin revelarlo.
 */
export function DropDiscount({ discount, caption, hidden = false, className }: { discount: Discount | null; caption: string; hidden?: boolean; className?: string }) {
  const sign = (text: string) => <span aria-hidden="true" className={cn(s.display, "pb-[0.06em] text-[clamp(1.6rem,6vw,3rem)] leading-none text-(--season-accent)")}>{text}</span>;
  return (
    <div className={cn("min-w-0 border-l-2 border-(--season-accent) pl-3 [--led-volt:var(--season-accent)]", className)}>
      <p className={cn(s.mono, "text-[10px] font-bold uppercase tracking-[0.18em] text-night-muted")}>{caption}</p>
      <div className="mt-1 flex items-end gap-1">
        {hidden || !discount ? (
          <Led value="--" label="Descuento: se revela al abrir" tone="volt" motion="none" className="h-10! sm:h-14! lg:h-16!" />
        ) : discount.led ? (
          <>
            {discount.sign === "$" && sign("$")}
            <Led value={discount.led} label={`${discount.label} de descuento`} tone="volt" motion="flip" className="h-10! sm:h-14! lg:h-16!" />
            {discount.sign === "%" && sign("%")}
          </>
        ) : (
          <strong className={cn(s.display, "text-4xl text-(--season-accent)")}>{discount.label}</strong>
        )}
        {!hidden && discount?.led && <span className={cn(s.display, "pb-1 text-xl text-on-night")}>off</span>}
      </div>
    </div>
  );
}
