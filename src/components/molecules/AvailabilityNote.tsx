import { CalendarClock, PackageCheck, PackageX } from "lucide-react";
import type { Availability } from "@/demo/engine/catalog";

export function AvailabilityNote({ availability }: { availability: Availability }) {
  if (availability.kind === "made-to-order") {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <CalendarClock size={18} className="text-primary" aria-hidden="true" />
        A pedido{availability.days ? ` · se fabrica en ${availability.days} días hábiles` : ""}
      </p>
    );
  }
  if (availability.kind === "in-stock") {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-success">
        <PackageCheck size={18} aria-hidden="true" /> En stock{availability.units <= 3 ? ` · últimas ${availability.units} unidades` : ""}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm font-bold text-danger">
      <PackageX size={18} aria-hidden="true" /> Sin stock en esta variante. Elegí otra o consultanos.
    </p>
  );
}
