/**
 * Estudio neutro de la revelación: grafito con una luz cenital blanca y la línea del piso. Usa solo la noche de la
 * marca (igual en claro y en oscuro), nunca `--season-*` ni los colores de la fecha del regalo. La tarjeta lleva un
 * corte en diagonal arriba a la derecha (lenguaje "Arena") y el filo voltio como luz de señal.
 */
export const STUDIO_CSS = `
.athlete-studio {
  background:
    radial-gradient(55% 40% at 50% 18%, color-mix(in srgb, white 13%, transparent), transparent 70%),
    linear-gradient(to bottom, transparent 84%, color-mix(in srgb, white 8%, transparent) 84.1%, transparent 84.4%),
    radial-gradient(90% 30% at 50% 100%, color-mix(in srgb, black 60%, transparent), transparent),
    linear-gradient(var(--c-night-2), var(--c-night));
}
.athlete-card { clip-path: polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%); position: relative; }
.athlete-card::after { content: ""; position: absolute; left: 0; right: 28px; top: 0; height: 2px; background: linear-gradient(90deg, var(--brand-volt), transparent 70%); opacity: .8; }
.athlete-to { text-shadow: 0 4px 28px rgb(0 0 0 / .85), 0 1px 0 rgb(0 0 0 / .6); letter-spacing: -.01em; }
.athlete-art::after { content: ""; position: absolute; inset: auto 0 0 0; height: 45%; background: linear-gradient(to top, rgb(5 6 8 / .85), transparent); pointer-events: none; }
.athlete-art > p { z-index: 1; }
`;
