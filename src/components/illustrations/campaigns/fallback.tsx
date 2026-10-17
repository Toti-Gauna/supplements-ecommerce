import { PropDefs, Rack, Tub } from "./props";
import { Backdrop, Beam, Dust, FLOOR, useArtIds } from "./stage";

/**
 * Escena neutra de la marca (sin fecha): el rack con un pote bajo el haz voltio. Es la provisoria de las campañas
 * cuyo arte llega en otro lote (parte B de R3a); el integrador la reemplaza en el registro.
 */
export function Fallback() {
  const ids = useArtIds();
  return (
    <>
      <Backdrop ids={ids} from="#0a0c10" to="#26282e" glow="#3a3d46" />
      <PropDefs ids={ids} />
      <Beam ids={ids} k="v" x0={400} x1={400} w={230} color="#c8ff2e" o={0.4} />
      <Rack ids={ids} x={400} y={FLOOR} w={330} top={120} shelf={540} />
      <Tub ids={ids} x={400} y={540} s={0.9} />
      <Dust seed={1} n={60} x={240} y={80} w={320} h={640} rMax={2.2} o={0.4} />
    </>
  );
}
