/** Comprobante de MUESTRA dibujado (no es un archivo real ni un comprobante bancario). */
export function SampleProof({ fileName, amount }: { fileName: string; amount: string }) {
  return (
    <figure className="flex w-full max-w-56 flex-col gap-1">
      <svg viewBox="0 0 200 260" role="img" aria-label={`Comprobante de muestra ${fileName}`} className="w-full rounded-xl border border-line bg-white">
        <rect x="16" y="18" width="90" height="10" rx="5" fill="#e4dccb" />
        <rect x="16" y="40" width="168" height="1" fill="#e4dccb" />
        {[60, 80, 100, 120].map((y) => <rect key={y} x="16" y={y} width={y % 40 === 0 ? 120 : 150} height="8" rx="4" fill="#efe8da" />)}
        <text x="16" y="160" fontSize="11" fill="#5b5e4f">Monto</text>
        <text x="16" y="182" fontSize="18" fontWeight="800" fill="#23251d">{amount}</text>
        <g transform="rotate(-14 100 220)"><rect x="34" y="204" width="132" height="30" rx="8" fill="#7a5200" /><text x="100" y="224" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">MUESTRA</text></g>
      </svg>
      <figcaption className="truncate text-xs text-muted">{fileName} · archivo ficticio</figcaption>
    </figure>
  );
}
