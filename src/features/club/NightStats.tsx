import { Led } from "@/components/atoms/Led";
import { cn } from "@/lib/cn";
import { NIGHT_PLATE } from "./styles";

export interface NightStat {
  label: string;
  /** Lo que dibuja el marcador ("0350", "3", "-"). */
  value: string;
  /** Lectura completa para lectores de pantalla. */
  reading: string;
  hint?: string;
}

/** Marcador del Club sobre la banda noche: placas de acero con su cifra en LED y el rótulo abajo. */
export function NightStats({ stats, label, className }: { stats: NightStat[]; label: string; className?: string }) {
  return (
    <dl aria-label={label} className={cn("grid grid-cols-3 gap-2 sm:gap-3", className)}>
      {stats.map((s) => (
        <div key={s.label} className={cn(NIGHT_PLATE, "flex min-w-0 flex-col-reverse gap-2 rounded-sm p-3 sm:p-4")}>
          <dt className="font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-night-muted sm:text-[11px]">
            {s.label}
          </dt>
          <dd>
            <Led value={s.value} label={s.reading} className="h-7! max-w-full sm:h-9!" />
            {s.hint && <span className="mt-1 block text-[11px] text-night-muted">{s.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
