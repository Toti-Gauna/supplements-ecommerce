/** Rótulo numerado de cada paso del armador. */
export function StepTitle({ n, title, id }: { n: number; title: string; id: string }) {
  return (
    <h3 id={id} className="lane flex items-baseline gap-3 pb-2 font-display text-xl uppercase leading-none tracking-wide">
      <span aria-hidden="true" className="font-mono text-sm text-volt-ink">{String(n).padStart(2, "0")}</span>{title}
    </h3>
  );
}
