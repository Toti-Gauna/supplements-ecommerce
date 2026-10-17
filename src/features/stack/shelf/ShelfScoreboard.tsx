import { Led } from "@/components/atoms/Led";
import { durationSpread, durationTolerance } from "@/demo/engine/stack-duration";
import { STACK_SLOTS } from "@/demo/fixtures/stack-builder";
import { cn } from "@/lib/cn";
import { SLOT_SHORT, slotNumber } from "../slot-labels";
import type { ShelfItem } from "./ShelfBay";

/**
 * Marcadores del rack, uno debajo de cada lugar: "te dura N días" en LED (un servicio por día). Si lo del estante no
 * dura parejo, lo que se termina primero queda en ámbar. Se lee como lista; no tiene nada enfocable.
 */
export function ShelfScoreboard({ items }: { items: ShelfItem[] }) {
  const bySlot = new Map(items.map((i) => [i.slot, i]));
  const days = items.flatMap((i) => (i.days ? [i.days] : []));
  const shortest = days.length ? Math.min(...days) : 0;
  const uneven = days.length > 1 && durationSpread(days) > durationTolerance(shortest);
  return (
    <ul aria-label="Cuánto te dura cada uno" className="grid grid-cols-4 gap-px bg-white/10 pt-px">
      {STACK_SLOTS.map((s, i) => {
        const item = bySlot.get(s.id);
        const first = uneven && item?.days === shortest;
        return (
          <li key={s.id} data-shelf-days={item?.days ?? undefined} className="flex min-w-0 flex-col items-center gap-1 bg-night px-1 pb-2 pt-1.5">
            <span className={cn("eyebrow truncate text-[9.5px] tracking-[0.12em]", item ? "text-volt" : "text-night-muted")}>
              {slotNumber(i)} {SLOT_SHORT[s.id]}{item && item.qty > 1 ? <span className="text-on-night"> ×{item.qty}</span> : null}
            </span>
            {item?.days ? (
              <span className="flex items-end gap-1">
                <Led value={String(item.days).padStart(2, "0")} motion="flip" tone={first ? "amber" : "volt"} className="h-5 sm:h-6"
                  label={`${SLOT_SHORT[s.id]}: ${item.name}${item.qty > 1 ? `, ${item.qty} unidades` : ""}, te dura ${item.days} días${first ? ", se termina primero" : ""}`} key={item.days} />
                <span aria-hidden="true" className="font-lab pb-px text-[10px] uppercase text-night-muted">días</span>
              </span>
            ) : (
              <span className="font-lab text-[11px] text-night-muted">{item ? "—" : "vacío"}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
