import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TimelineStep {
  label: string;
  description: string;
  date?: string;
  state: "done" | "current" | "pending";
}

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative flex flex-col gap-5 border-l-2 border-line pl-6">
      {steps.map((s) => (
        <li key={s.label} className="relative" aria-current={s.state === "current" ? "step" : undefined}>
          <span
            className={cn(
              "absolute -left-[35px] top-0.5 grid h-5 w-5 place-items-center rounded-full border-2",
              s.state === "done" && "border-primary bg-primary text-on-primary",
              s.state === "current" && "border-primary bg-surface ring-4 ring-primary/15",
              s.state === "pending" && "border-line bg-surface",
            )}
          >
            {s.state === "done" && <Check size={12} aria-hidden="true" />}
          </span>
          <p className={cn("font-bold", s.state === "pending" ? "text-muted" : "text-ink")}>
            {s.label} {s.state === "current" && <span className="ml-1 text-xs font-bold text-primary">· estado actual</span>}
          </p>
          <p className="text-sm text-muted">{s.description}</p>
          {s.date && <p className="text-xs text-muted">{s.date}</p>}
        </li>
      ))}
    </ol>
  );
}
