import type { ReactNode } from "react";
import { IconPlate } from "@/components/illustrations/GymIcons";

/** Estado vacío del box: una placa con el disco sin cargar, el titular en display y lo que se puede hacer. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="plate animate-fade-up relative flex flex-col items-center gap-4 overflow-hidden rounded-sm border border-line px-6 py-14 text-center">
      <span aria-hidden="true" className="lane absolute inset-x-0 top-0 h-1" />
      <span aria-hidden="true" className="grid size-16 place-items-center border border-dashed border-line text-muted">
        <IconPlate size={34} strokeWidth={1.6} />
      </span>
      <h2 className="font-display text-3xl">{title}</h2>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
      {action}
    </div>
  );
}
