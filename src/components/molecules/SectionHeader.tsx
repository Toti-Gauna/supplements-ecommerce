import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeader({ id, title, href, linkLabel = "Ver todo", children }: { id?: string; title: string; href?: string; linkLabel?: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>
        {children && <p className="mt-0.5 text-sm text-muted">{children}</p>}
      </div>
      {href && <Link href={href} className="shrink-0 text-sm font-bold text-primary underline-offset-4 hover:underline">{linkLabel}</Link>}
    </div>
  );
}
