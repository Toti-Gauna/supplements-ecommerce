import { RackDefs } from "../RackShot";
import { PackDefs } from "./defs";
import { GymDefs, StudioDefs } from "./scenes";

/**
 * Definiciones de la librería de envases, una vez y visibles, al principio del <body>. Cada ilustración trae las
 * suyas (idénticas, para pasarla a imagen en el Estudio), pero un `url(#id)` usa el PRIMER elemento con ese id del
 * documento: si ese primero está dentro de algo oculto (la pantalla de carga terminada, un menú cerrado), el navegador
 * no pinta el degradé. Estas van antes que todo y nunca se ocultan (miden 0 × 0).
 */
export function GlobalArtDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <PackDefs />
      <StudioDefs />
      <GymDefs />
      <RackDefs />
    </svg>
  );
}
