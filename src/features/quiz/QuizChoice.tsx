import { Check } from "lucide-react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface QuizChoiceProps {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Ícono o dibujo a la izquierda. */
  icon?: ReactNode;
  /** Color del acento al elegirla (por defecto, voltio). */
  hue?: string;
  className?: string;
}

/** Clases compartidas con las fichas de deporte (`QuizSportOptions`): misma tarjeta, mismo encendido al elegirla. */
export const CHOICE_CARD = "relative rounded-sm bg-white/[0.04] ring-1 ring-white/10 transition-[background-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-white/[0.08] active:scale-[0.985] motion-reduce:active:scale-100";
export const CHOICE_ON = "bg-[color-mix(in_oklab,var(--hue)_12%,transparent)] shadow-[0_0_0_2px_var(--hue),0_18px_40px_-22px_var(--hue)] ring-transparent hover:bg-[color-mix(in_oklab,var(--hue)_16%,transparent)]";
export const CHOICE_INPUT = "absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt";

/**
 * Volver a elegir un radio que ya estaba elegido (clic, toque o espacio): el navegador no avisa un cambio, así que se
 * escucha aparte. Si además llega el clic del espacio, se repite la misma elección (no pasa nada).
 */
export function reselect(checked: boolean, pick: () => void) {
  if (!checked) return {};
  return { onClick: pick, onKeyUp: (e: KeyboardEvent) => { if (e.key === " ") pick(); } };
}

/** La marca de elegida (cuadrada en los radios, redondeada en los checkbox). */
export function ChoiceMark({ type, checked, className }: { type: "radio" | "checkbox"; checked: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("grid h-6 w-6 shrink-0 place-items-center ring-1 transition-colors", type === "radio" ? "rounded-sm" : "rounded-md",
      checked ? "bg-[var(--hue)] text-night ring-transparent" : "ring-white/25", className)}>
      {checked && <Check size={15} strokeWidth={3} />}
    </span>
  );
}

/**
 * Opción del quiz sobre la banda noche: un radio o checkbox NATIVO que cubre toda la tarjeta (clic, toque, flechas y
 * espacio como siempre; el foco se ve en el borde) y debajo el dibujo, el texto y la marca de elegida. Tocar de nuevo
 * un radio ya elegido vuelve a elegirlo (el quiz avanza igual que la primera vez).
 */
export function QuizChoice({ type, name, value, checked, onChange, title, description, icon, hue, className }: QuizChoiceProps) {
  return (
    <label style={{ "--hue": hue ?? "var(--color-volt)" } as CSSProperties}
      className={cn(CHOICE_CARD, "flex min-h-16 items-center gap-3 p-3.5", checked && CHOICE_ON, className)}>
      <input type={type} name={name} value={value} checked={checked} onChange={(e) => onChange(e.target.checked)}
        {...(type === "radio" ? reselect(checked, () => onChange(true)) : {})} className={CHOICE_INPUT} />
      {icon && <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-white/[0.06] text-[color:var(--hue)] ring-1 ring-white/10">{icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold leading-tight text-on-night">{title}</span>
        {description && <span className="text-[13px] leading-snug text-night-muted">{description}</span>}
      </span>
      <ChoiceMark type={type} checked={checked} />
    </label>
  );
}
