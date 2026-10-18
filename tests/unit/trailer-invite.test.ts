import { describe, expect, it } from "vitest";
import { shouldInviteToTrailer } from "@/features/trailer-invite/trailer-invite";

describe("aviso del trailer", () => {
  it("sale en la tienda si no se vio, nunca en compra, panel, regalo, pedido ni en el propio trailer", () => {
    expect(shouldInviteToTrailer({ path: "/", seen: false })).toBe(true);
    expect(shouldInviteToTrailer({ path: "/club/", seen: false })).toBe(true);
    expect(shouldInviteToTrailer({ path: "/", seen: true })).toBe(false);
    for (const path of ["/checkout/", "/admin-demo/", "/regalo/", "/pedido/demo-volta/", "/trailer/firma/", "/crear/quiz/"]) expect(shouldInviteToTrailer({ path, seen: false }), path).toBe(false);
  });
});
