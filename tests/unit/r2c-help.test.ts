import { describe, expect, it } from "vitest";
import { defaultAdminData, type AdminData } from "@/demo/admin/defaults";
import { migrateAdminData } from "@/demo/admin/migrate";
import { withFaqTopics } from "@/demo/admin/migrate-faqs";
import { groupFaqs, helpResults, inferFaqTopic, searchFaqs, withTopic } from "@/demo/engine/help";
import { storeFaqs } from "@/demo/fixtures/content";
import { FAQ_TOPICS } from "@/demo/fixtures/help";
import { ADMIN_STORE_VERSION } from "@/stores/storage";

const qs = (list: { q: string }[]) => list.map((f) => f.q);

describe("ayuda del box: temas", () => {
  it("las preguntas de muestra cubren los 7 temas, en el orden de la página", () => {
    expect(groupFaqs(storeFaqs).map((g) => g.topic.id)).toEqual(["compras", "envios", "pagos", "cambios", "suplementos", "equipamiento", "club"]);
    expect(FAQ_TOPICS.map((t) => t.label)).toContain("Envíos y cadete");
  });

  it("sin tema guardado, se deduce del texto (y lo deducido coincide con el de muestra)", () => {
    for (const f of storeFaqs.slice(0, 7)) expect(inferFaqTopic(f), f.q).toBe(f.topic);
    expect(inferFaqTopic({ q: "¿Hacen factura?", a: "Sí." })).toBe("compras");
    expect(withTopic({ q: "¿Qué talle de rodillera?", a: "Medí la rodilla.", topic: "inventado" }).topic).toBe("equipamiento");
  });
});

describe("ayuda del box: buscador", () => {
  it("no distingue tildes ni mayúsculas", () => {
    const sin = qs(searchFaqs(storeFaqs, "credito"));
    expect(sin).toContain("¿Cómo puedo pagar?");
    expect(qs(searchFaqs(storeFaqs, "CRÉDITO"))).toEqual(sin);
  });

  it("busca en la pregunta, la respuesta y el nombre del tema, con plurales y un error leve", () => {
    expect(qs(searchFaqs(storeFaqs, "devoluciones"))).toContain("¿Qué pasa si me arrepiento?");
    expect(qs(searchFaqs(storeFaqs, "cinturon"))).toContain("¿Cómo elijo el talle del cinturón?");
    expect(qs(searchFaqs(storeFaqs, "cretina"))).toContain("¿La creatina se toma todos los días?");
    expect(qs(searchFaqs(storeFaqs, "guante"))).not.toContain("¿Cómo elijo el talle del cinturón?");
  });

  it("todas las palabras cuentan, sin las que no dicen nada", () => {
    expect(qs(searchFaqs(storeFaqs, "¿cómo es el talle del guante?"))).toEqual(["¿Qué onzas de guantes me convienen?"]);
    expect(qs(searchFaqs(storeFaqs, "el talle de la cintura"))).toEqual(["¿Cómo elijo el talle del cinturón?"]);
    expect(searchFaqs(storeFaqs, "  ")).toHaveLength(storeFaqs.length);
  });

  it("devuelve los grupos con lo encontrado y la cuenta", () => {
    const r = helpResults(storeFaqs, "envio");
    expect(r.count).toBeGreaterThan(0);
    expect(r.groups.every((g) => g.items.length > 0)).toBe(true);
    const order = r.groups.map((g) => FAQ_TOPICS.findIndex((t) => t.id === g.topic.id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(r.groups.map((g) => g.topic.id)).toContain("envios");
    expect(helpResults(storeFaqs, "zzzz")).toEqual({ groups: [], count: 0 });
  });
});

describe("v16: temas de la ayuda en un panel guardado", () => {
  /** Un panel guardado en v15: las 7 preguntas viejas sin tema, una editada y una propia del dueño. */
  function savedV15(): AdminData {
    const base = defaultAdminData();
    const old = storeFaqs.slice(0, 7).map(({ q, a }) => ({ q, a }));
    old[1] = { ...old[1]!, a: "Respuesta editada por el dueño." };
    const faqs = [...old, { q: "¿Hacen envíos a Miramar?", a: "Sí, con correo." }];
    return { ...base, data: { ...base.data, content: { ...base.data.content, faqs: faqs as AdminData["data"]["content"]["faqs"] } } };
  }

  it("la versión del panel sube a 16", () => {
    expect(ADMIN_STORE_VERSION).toBeGreaterThanOrEqual(16);
  });

  it("pone tema a cada pregunta sin tocar el texto y suma solo las preguntas nuevas", () => {
    const faqs = withFaqTopics(savedV15()).data!.content.faqs;
    expect(faqs).toHaveLength(storeFaqs.length + 1);
    expect(faqs[1]).toEqual({ q: "¿Qué marcas tienen?", a: "Respuesta editada por el dueño.", topic: "compras" });
    expect(faqs[7]).toEqual({ q: "¿Hacen envíos a Miramar?", a: "Sí, con correo.", topic: "envios" });
    expect(faqs.every((f) => FAQ_TOPICS.some((t) => t.id === f.topic))).toBe(true);
    expect(new Set(faqs.map((f) => f.q)).size).toBe(faqs.length);
  });

  it("corre al migrar desde v15 y no se repite desde v16", () => {
    const from15 = migrateAdminData(savedV15(), 15).data!.content.faqs;
    expect(from15).toHaveLength(storeFaqs.length + 1);
    const again = migrateAdminData({ ...savedV15(), data: { ...savedV15().data, content: { ...savedV15().data.content, faqs: from15.slice(0, 3) } } }, 16);
    expect(again.data!.content.faqs).toHaveLength(3);
  });
});
