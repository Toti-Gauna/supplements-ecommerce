import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/** Encabezado de sección del Club: rótulo, título y bajada con el mismo ritmo en toda la página (y en la liga). */
export function ClubHeading({ id, eyebrow, title, children, night }: { id: string; eyebrow: string; title: string; children?: ReactNode; night?: boolean }) {
  return (
    <Reveal>
      <p className={cn("eyebrow", night ? "text-volt" : "text-volt-ink")}>{eyebrow}</p>
      <h2 id={id} className="font-display mt-2 scroll-mt-28 text-4xl leading-tight sm:text-5xl">{title}</h2>
      {children && <p className={cn("mt-2 max-w-xl", night ? "text-night-muted" : "text-muted")}>{children}</p>}
    </Reveal>
  );
}
