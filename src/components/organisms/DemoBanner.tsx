import { ResetDemoButton } from "./ResetDemoButton";

export function DemoBanner() {
  return (
    <div role="note" className="bg-night text-on-night">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-4 py-2 text-center text-[12px] font-semibold sm:text-[13px]">
        <span className="eyebrow text-volt">Demo de venta</span>
        <span>No se cobra nada ni se guarda ningún pedido real · precios y stock de muestra</span>
        <ResetDemoButton className="underline decoration-volt underline-offset-4 hover:text-white" />
      </p>
    </div>
  );
}
