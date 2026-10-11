import { ChevronDown } from "lucide-react";
import type { Faq } from "@/demo/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {faqs.map((f) => (
        <details key={f.q} className="group px-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-bold [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="animate-fade-in pb-4 text-sm text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
