import { describe, expect, it } from "vitest";
import { dayProtocol, productMoment } from "@/demo/engine/protocol";
import { recommendStack } from "@/demo/engine/quiz";
import { products } from "@/demo/fixtures/products";
import type { Product } from "@/demo/types";

const p = (slug: string) => products.find((x) => x.slug === slug)!;
const moments = (slugs: string[], time?: "manana" | "tarde" | "noche") =>
  dayProtocol(slugs.map(p), time).map((b) => `${b.clock} ${b.moment}: ${b.items.map((i) => i.slug).join("+")}`);

describe("el protocolo del día", () => {
  it("cada producto va en el primer momento de su 'Cómo tomarlo'", () => {
    expect(productMoment(p("ionic-whey")).moment).toBe("post");
    expect(productMoment(p("creatina-monohidrato")).moment).toBe("manana");
    expect(productMoment(p("overvolt-pre"))).toEqual({ moment: "pre", during: false, trainingOnly: true });
    expect(productMoment(p("night-casein")).moment).toBe("noche");
    // Durante el entreno va en el bloque del pre; con una comida, a la mañana.
    expect(productMoment(p("bcaa-211"))).toEqual({ moment: "pre", during: true, trainingOnly: true });
    expect(productMoment(p("omega-3")).moment).toBe("manana");
  });

  it("entrenando a la tarde: mañana, pre, post y noche en orden de reloj", () => {
    expect(moments(["ionic-whey", "creatina-monohidrato", "overvolt-pre", "magnesio-bisglicinato"], "tarde")).toEqual([
      "08:00 manana: creatina-monohidrato",
      "17:30 pre: overvolt-pre",
      "19:15 post: ionic-whey",
      "23:00 noche: magnesio-bisglicinato",
    ]);
  });

  it("entrenando a la mañana: el pre y el post van antes del desayuno", () => {
    const blocks = dayProtocol(["ionic-whey", "creatina-monohidrato", "overvolt-pre"].map(p), "manana");
    expect(blocks.map((b) => [b.clock, b.moment])).toEqual([["06:30", "pre"], ["08:15", "post"], ["08:45", "manana"]]);
    expect(blocks[2]!.when).toBe("Con el desayuno, después de entrenar");
  });

  it("de noche el post cae tarde y la noche sigue al final", () => {
    expect(moments(["ionic-whey", "night-casein"], "noche")).toEqual(["21:45 post: ionic-whey", "23:00 noche: night-casein"]);
  });

  it("trae la dosis y el modo de uso, sin repetidos ni equipamiento", () => {
    const gear = products.find((x) => x.categorySlug === "accesorios")!;
    const [block] = dayProtocol([p("ionic-whey"), p("ionic-whey"), gear]);
    expect(block!.items).toEqual([{ slug: "ionic-whey", name: "Ionic Whey 100%", dose: "1 scoop (30 g)", how: p("ionic-whey").usage!.text, trainingOnly: false, during: false }]);
  });

  it("sin datos de uso, por la categoría", () => {
    const bare: Product = { ...p("creatina-brava"), usage: undefined };
    expect(productMoment(bare).moment).toBe("manana");
    expect(productMoment({ ...p("ionic-whey"), usage: undefined }).moment).toBe("post");
  });

  it("el programa del quiz arma su protocolo con sus productos", () => {
    const r = recommendStack({ goals: ["fuerza"], sport: null, days: "3-4", time: "tarde", restrictions: [] }, products);
    const blocks = dayProtocol(r.picks.map((x) => p(x.slug)), "tarde");
    expect(blocks.flatMap((b) => b.items.map((i) => i.slug)).sort()).toEqual(r.picks.map((x) => x.slug).sort());
    expect(blocks.map((b) => b.label)).toEqual(["Mañana", "Pre-entreno", "Post-entreno"]);
  });
});
