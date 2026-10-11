import type { ReactNode } from "react";

export function AdminPageHeader({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-4xl sm:text-5xl">{title} <span className="font-sans align-middle text-sm font-bold text-warning">(demo)</span></h1>
        {children && <p className="mt-1 max-w-2xl text-sm text-muted">{children}</p>}
      </div>
      {actions}
    </div>
  );
}
