import { defineRecipe } from "../engine/recipe";
import { buildLatido, LatidoView } from "./trace-latido";
import { buildPlano, PlanoView } from "./trace-plano";
import { Grid, Sup, TPL } from "./tpl";

export interface TraceProps { part: "plano" | "latido"; text: string[] }

/**
 * La línea de 1 px de la pieza T1: en `plano` es la relación que no existe después de comprar (un click, una caja que se
 * va y una línea plana); en `latido` esa línea late, se vuelve volt y se abre en el marco de la tienda.
 */
export const trace = defineRecipe<TraceProps>({
  id: "trace",
  Component: ({ props, ratio }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: TPL.bg }}>
      {props.part === "plano" ? (
        <>
          <Grid ratio={ratio} color={TPL.grid} />
          <PlanoView ratio={ratio} />
          <Sup text={props.text.join(" ")} ratio={ratio} />
        </>
      ) : <LatidoView ratio={ratio} text={props.text} />}
    </div>
  ),
  build: (ctx) => (ctx.props.part === "plano" ? buildPlano(ctx) : buildLatido(ctx)),
});
