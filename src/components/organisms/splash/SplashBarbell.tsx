/**
 * Barra olímpica de la pantalla de carga original (R3c): HTML mínimo (va en cada página) dibujado con CSS en
 * app/splash-barbell.css. Cada lado es la traba, cuatro discos y el tope; el derecho es el mismo lado espejado. Los
 * discos entran de a pares desde afuera y encastran, cierran las trabas y un brillo corre por la barra. Con una fecha
 * sin escena propia todavía (variante de campaña de R3a) los discos toman el color de la fecha.
 */
function Side() {
  return (
    <b>
      <i className="bp-clip" />
      <i className="bp" />
      <i className="bp" />
      <i className="bp" />
      <i className="bp" />
      <i className="bp-stop" />
    </b>
  );
}

export function SplashBarbell() {
  return (
    <span className="splash-barbell" aria-hidden="true">
      <Side />
      <Side />
      <i className="bp-glint" />
    </span>
  );
}
