import Link from "next/link";
import type { ReactNode } from "react";

export function StatTile({ label, value, hint, href, icon }: { label: string; value: ReactNode; hint?: string; href?: string; icon?: ReactNode }) {
  const body = (
    <>
      <span className="flex items-center gap-2 text-sm font-bold text-muted">{icon}{label}</span>
      <span className="break-words text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </>
  );
  const cls = "flex min-h-28 flex-col gap-1 rounded-2xl border border-line bg-surface p-4";
  return href ? <Link href={href} className={`${cls} hover:border-primary`}>{body}</Link> : <div className={cls}>{body}</div>;
}
