import { defineRecipe, type SceneCtx } from "../engine/recipe";
import { TR } from "./kit";
import { buildCuotas, CuotasView, type CuotasProps } from "./plate-cuotas";
import { buildProveedor, ProveedorView, type ProveedorProps } from "./plate-proveedor";
import { buildTema, TemaView, type TemaProps } from "./plate-tema";

export type PlateProps = TemaProps | CuotasProps | ProveedorProps;

/**
 * Pantallas reales de la app como placas (capturas 2× de `scripts/trailer-plates.mjs`) y, encima y en vivo, solo lo que se
 * mueve: el trazo, el círculo del tema, la cifra que se despega, la cuenta con sus rayas. Las cajas vienen medidas de la app.
 */
export const plate = defineRecipe<PlateProps>({
  id: "plate",
  Component: ({ props, ratio }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
      {props.mode === "tema" ? <TemaView props={props} ratio={ratio} /> : props.mode === "cuotas" ? <CuotasView props={props} ratio={ratio} /> : <ProveedorView props={props} ratio={ratio} />}
    </div>
  ),
  build: (ctx) => {
    const p = ctx.props;
    if (p.mode === "tema") return buildTema(ctx as SceneCtx<TemaProps>);
    if (p.mode === "cuotas") return buildCuotas(ctx as SceneCtx<CuotasProps>);
    return buildProveedor(ctx as SceneCtx<ProveedorProps>);
  },
});
