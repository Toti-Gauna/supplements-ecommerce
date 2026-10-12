"use client";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import Link from "next/link";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { productHref } from "@/demo/engine/catalog";
import type { StackLineView } from "@/demo/engine/stack-builder";
import { STACK_SLOTS } from "@/demo/fixtures/stack-builder";
import { formatARS } from "@/lib/money";

interface Props {
  line: StackLineView;
  /** Por qué va este producto (sale del motor del quiz). */
  reasons: string[];
  index: number;
  animate: boolean;
}

/** Un producto del stack recomendado: envase, lugar del estante, variante, precio y el porqué. */
export function QuizPickCard({ line, reasons, index, animate }: Props) {
  const { product, variant } = line;
  const slot = STACK_SLOTS.find((s) => s.id === line.slot);
  return (
    <motion.li initial={animate ? { opacity: 0, y: 22 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col rounded-[var(--radius-card)] edge-volt" data-quiz-pick={product.slug}>
      <div className="flex gap-4 p-4">
        <ProductArt art={product.art} pack={product.pack} tint={variant.colorHex} label="" showBadge={false} className="h-28 w-28 shrink-0 rounded-2xl sm:h-32 sm:w-32" />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="eyebrow text-volt-ink"><span className="font-lab">{String(index + 1).padStart(2, "0")}</span> · {slot?.name ?? line.slot}</p>
          <h3 className="mt-1.5 text-[17px] font-extrabold leading-tight">
            <Link href={productHref(product.slug)} className="hover:underline">{product.name}</Link>
          </h3>
          <p className="mt-0.5 text-[13px] text-muted">{variant.label}</p>
          <p className="font-lab mt-auto pt-2 text-lg font-bold">{formatARS(line.price)}</p>
          {line.perServing !== null && <p className="font-lab text-xs text-muted">{formatARS(line.perServing)} por servicio</p>}
        </div>
      </div>
      <div className="mt-auto border-t border-line px-4 pb-4 pt-3">
        <p className="eyebrow text-muted">Por qué</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {reasons.map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm leading-snug">
              <span aria-hidden="true" className="mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-on-primary"><Check size={11} strokeWidth={3.2} /></span>{r}
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}
