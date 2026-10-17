import type { SeasonId } from "@/demo/types";

/** Rutas de Campañas (R3). Las de "Temáticas" siguen llevando acá. */
export const CAMPAIGNS = { href: "/admin-demo/campanas/", label: "Campañas" } as const;
export const editorHref = (id: SeasonId) => `/admin-demo/campanas/editar/?id=${id}`;
export const piecesHref = (id: SeasonId) => `/admin-demo/campanas/piezas/?id=${id}`;
