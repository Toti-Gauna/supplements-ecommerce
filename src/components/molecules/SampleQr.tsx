/** Placeholder NO escaneable: el QR real de Volta se carga desde el panel cuando se cobre la seña. */
export function SampleQr() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 37 + (i % 5) * 11) % 3 === 0);
  return (
    <figure className="flex w-fit flex-col items-center gap-2">
      <div className="relative grid h-44 w-44 grid-cols-7 gap-1 rounded-2xl border-4 border-dashed border-warning bg-surface p-3" aria-hidden="true">
        {cells.map((on, i) => <span key={i} className={on ? "rounded-sm bg-line" : ""} />)}
        <span className="absolute inset-0 grid place-items-center">
          <span className="rotate-[-12deg] rounded-lg bg-warning px-2 py-1 text-sm font-extrabold text-white">QR DE MUESTRA</span>
        </span>
      </div>
      <figcaption className="text-xs font-bold text-warning">No es un QR real · no escanear</figcaption>
    </figure>
  );
}
