// Capturas del panel para el trailer (mismo formato que trailer-shots-shop.mjs). Rutas bajo admin-demo/.
const dlg = (name) => (p) => p.getByRole("dialog", { name });
const addPots = async (p) => {
  for (const [q, key] of [["whey vainilla", "ionic-whey::iw-vainilla-2lb"], ["creatina", "creatina-monohidrato::cm-sin-sabor-300"], ["overvolt", "overvolt-pre::ov-limon-300"]]) {
    await p.getByLabel("Buscar para vender").fill(q);
    await p.locator(`[data-pot='${key}']`).click();
  }
};
const payInstallments = async (p) => {
  await addPots(p);
  await p.getByRole("button", { name: /^Cobrar/ }).filter({ visible: true }).first().click();
  await p.getByRole("dialog", { name: /^Cobrar/ }).getByText("3 cuotas", { exact: true }).click();
};
const openLot = async (p) => {
  await p.locator("[data-action^='lot:']").first().getByRole("button", { name: /Liquidar/ }).click();
  await p.getByRole("dialog", { name: /Liquidar el lote/ }).waitFor();
};
const lotTab = (name) => async (p) => { await openLot(p); await p.getByRole("tab", { name }).click(); };

export const ADMIN = [
  { id: "hoy", route: "admin-demo/", wait: 1200 },
  { id: "hoy-marcador", route: "admin-demo/", target: (p) => p.locator("ul:has([data-score])") },
  { id: "hoy-lista", route: "admin-demo/", target: (p) => p.locator("ul:has([data-action])") },
  { id: "mostrador-vender", route: "admin-demo/mostrador/", prep: addPots },
  { id: "mostrador-ticket", route: "admin-demo/mostrador/", prep: addPots, target: (p) => p.locator("aside[aria-label='Ticket'], [aria-label='Ticket en curso']").filter({ visible: true }) },
  { id: "mostrador-cuotas", route: "admin-demo/mostrador/", prep: payInstallments, target: dlg(/^Cobrar/) },
  { id: "mostrador-chat", route: "admin-demo/mostrador/chat/" },
  { id: "mostrador-cierre", route: "admin-demo/mostrador/cierre/" },
  { id: "mostrador-consulta", route: "admin-demo/mostrador/consulta/" },
  { id: "pedidos-cobrar", route: "admin-demo/pagos/" },
  { id: "pedidos-armar", route: "admin-demo/preparacion/" },
  { id: "pedidos-despachos", route: "admin-demo/despachos/?dia=2026-10-09" },
  { id: "pedidos-postventa", route: "admin-demo/postventa/" },
  { id: "pedidos-todos", route: "admin-demo/pedidos/" },
  { id: "pedido-detalle", route: "admin-demo/pedidos/detalle/?codigo=TUT-000113" },
  { id: "whatsapp-estado", route: "admin-demo/emails/", prep: async (p) => { await p.getByRole("button", { name: "Editar el WhatsApp: En reclamo" }).click(); await dlg("En reclamo")(p).waitFor(); }, target: dlg("En reclamo") },
  { id: "stock-lotes", route: "admin-demo/productos/?ver=variantes" },
  { id: "lote-liquidar", route: "admin-demo/", prep: openLot, target: dlg(/Liquidar el lote/) },
  { id: "lote-combo", route: "admin-demo/", prep: lotTab("Combo"), target: dlg(/Liquidar el lote/) },
  { id: "lote-cupon", route: "admin-demo/", prep: lotTab("Cupón"), target: dlg(/Liquidar el lote/) },
  { id: "lote-drop", route: "admin-demo/", prep: lotTab("Drop"), target: dlg(/Liquidar el lote/) },
  { id: "proveedor-diferencias", route: "admin-demo/lista-proveedor/", prep: async (p) => { await p.getByRole("button", { name: "Cargar la lista de muestra" }).click(); await p.locator("[data-diff-summary]").waitFor(); }, wait: 2500 },
  { id: "costos-vivos", route: "admin-demo/costos/vivos/" },
  { id: "clientes-recompra", route: "admin-demo/usuarios/", target: (p) => p.getByRole("region", { name: "A quién escribirle hoy" }) },
  { id: "cliente-cumple", route: "admin-demo/usuarios/ficha/?email=tomas.h%40ejemplo.com" },
  { id: "promos-cupones", route: "admin-demo/promos/" },
  { id: "promos-stack", route: "admin-demo/descuento-stack/" },
  { id: "promos-ruleta", route: "admin-demo/cupones/ruleta/" },
  { id: "promos-juego", route: "admin-demo/cupones/juego/" },
  { id: "promos-misiones", route: "admin-demo/misiones/" },
  { id: "promos-regalos", route: "admin-demo/regalos/" },
  { id: "campanas-calendario", route: "admin-demo/campanas/" },
  { id: "campanas-editor", route: "admin-demo/campanas/editar/?id=black-friday" },
  { id: "ajustes-pagos", route: "admin-demo/ajustes/pagos/" },
];
