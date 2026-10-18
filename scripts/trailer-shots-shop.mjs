// Capturas de la tienda para el trailer. Cada una: { id, route, only?: "desktop"|"mobile", prep?(page), target?(page), wait? }.
// Sin `target` se saca la ventana entera. Los selectores salen de docs/trailer/biblia/ui.md.
const seedCart = (page, { key }) => page.evaluate((k) => localStorage.setItem(`${k}-demo:cart`, JSON.stringify({ state: { lines: [
  { id: "l1", productSlug: "colageno", variantId: "co-limon-300", quantity: 2 },
  { id: "l2", productSlug: "ionic-whey", variantId: "iw-vainilla-2lb", quantity: 1 }], couponCode: null }, version: 0 })), key);
const signIn = (page, { key }) => page.evaluate((k) => localStorage.setItem(`${k}-demo:account`, JSON.stringify({ state: { user: { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" }, usedRewards: [], sort: "relevance", wheelPrize: null }, version: 0 })), key);
const reload = (page) => page.reload();
const withState = (fn) => async (page, ctx) => { await fn(page, ctx); await reload(page); };
const dlg = (name) => (p) => p.getByRole("dialog", { name });

export const SHOP = [
  { id: "home-carrusel", route: "", target: (p) => p.locator("section[aria-roledescription='carrusel']") },
  { id: "home-categorias", route: "", target: (p) => p.locator("section[aria-labelledby='cats-title']") },
  { id: "home-objetivos", route: "", target: (p) => p.locator("section[aria-labelledby='objetivos-title']") },
  { id: "buscar-typo", route: "buscar/?q=creatna", wait: 1200 },
  { id: "ficha-completa", route: "p/ionic-whey/" },
  { id: "ficha-galeria", route: "p/ionic-whey/", target: (p) => p.locator("[data-vt-hero]") },
  { id: "ficha-configurar", route: "p/ionic-whey/", target: (p) => p.getByRole("region", { name: "Elegí sabor, tamaño y cantidad" }) },
  { id: "ficha-compra-barra", route: "p/creatina-monohidrato/", only: "mobile", target: (p) => p.locator("[data-buy-bar]") },
  { id: "comparar-bandeja", route: "c/proteinas/", prep: async (p) => {
    await p.getByRole("button", { name: "Comparar Ionic Whey 100%", exact: true }).click({ force: true });
    await p.getByRole("button", { name: "Comparar Proteína vegana arveja + arroz", exact: true }).click({ force: true });
  } },
  { id: "comparar-tabla", route: "comparar/?p=ionic-whey,proteina-vegana", target: (p) => p.locator("#contenido") },
  { id: "stack-armador", route: "crear/", prep: async (p) => { await p.locator("[data-stack-ready]").waitFor(); await p.getByRole("checkbox", { name: /^Fuerza/ }).check({ force: true }); } },
  { id: "stack-resumen", route: "crear/", target: (p) => p.getByRole("region", { name: "Resumen de tu stack" }), prep: async (p) => { await p.locator("[data-stack-ready]").waitFor(); await p.getByRole("checkbox", { name: /^Fuerza/ }).check({ force: true }); } },
  { id: "quiz-inicio", route: "crear/quiz/", target: (p) => p.locator("#contenido") },
  { id: "packs-lista", route: "packs/", target: (p) => p.locator("#contenido") },
  { id: "packs-detalle", route: "packs/?pack=hipertrofia", target: (p) => p.locator("#contenido") },
  { id: "carrito", route: "carrito/", prep: withState(seedCart), target: (p) => p.locator("#contenido") },
  { id: "checkout-datos", route: "checkout/", prep: withState(seedCart) },
  { id: "seguimiento-entregado", route: "pedido/demo-tutienda-entregado/", target: (p) => p.locator("#contenido") },
  { id: "seguimiento-etapas", route: "pedido/demo-tutienda-entregado/", target: (p) => p.getByRole("region", { name: "Etapas del pedido" }) },
  { id: "club-inicio", route: "club/", prep: withState(signIn), wait: 2500 },
  { id: "club-niveles", route: "club/", prep: withState(signIn), target: (p) => p.getByRole("list", { name: "Tabla de niveles" }) },
  { id: "club-misiones", route: "club/", prep: withState(signIn), target: (p) => p.locator("section[aria-labelledby='mis']") },
  { id: "cupones", route: "cupones/", prep: withState(signIn), target: (p) => p.locator("#contenido") },
  { id: "ruleta", route: "club/", prep: async (p) => {
    await p.evaluate(() => { Math.random = () => 0.1; });
    await p.getByRole("button", { name: "Girar la ruleta" }).first().click();
    await dlg("Ruleta de cupones")(p).waitFor();
  }, target: dlg("Ruleta de cupones") },
  { id: "juego-inicio", route: "club/juego/", target: (p) => p.locator("#contenido") },
  { id: "regalar-modal", route: "p/ionic-whey/", prep: async (p) => { await p.getByRole("button", { name: /Regalar ahora/ }).first().click(); await dlg("Regalá energía")(p).waitFor(); }, target: dlg("Regalá energía") },
  { id: "regalo-bolsa", route: "regalo/?c=REGALO-VE1M-AR7X" },
  { id: "regalo-locker", route: "regalo/?c=REGALO-SAB0-R01D" },
  { id: "regalo-giftcard", route: "regalo/?c=REGALO-GC0S-0F1D" },
  { id: "campana-black-friday", route: "campana/?id=black-friday&fase=vivo" },
  { id: "modo-dueno", route: "?dueno=1" },
];
