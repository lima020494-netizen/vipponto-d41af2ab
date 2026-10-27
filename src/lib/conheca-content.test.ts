import { test } from "node:test";
import assert from "node:assert/strict";
import { CONHECA_DEFAULT, conhecaSchema, resolveConheca } from "./conheca-content";

test("missing commercial configuration supplies all three editable plans and contact", () => {
  const config = resolveConheca(null);
  assert.equal(config.whatsapp, "5591999999999");
  assert.deepEqual(config.plans.map(({ name, price }) => [name, price]), [["Básico", "49"], ["Pro", "89"], ["Enterprise", null]]);
});

test("configured WhatsApp, values and benefits survive a commercial read", () => {
  const config = { ...CONHECA_DEFAULT, whatsapp: "5591988887777", plans: CONHECA_DEFAULT.plans.map((p, i) => i === 0 ? { ...p, name: "Equipe", price: "62,50", benefits: ["Folha mensal", "Suporte"] } : p) };
  assert.deepEqual(resolveConheca(config), config);
});
test("hero module: legacy content without hero gets defaults; non-HTTPS image rejected", () => {
  const legado = { ...CONHECA_DEFAULT } as Record<string, unknown>; delete legado["hero"];
  assert.equal(resolveConheca(legado).hero.cta_primary, "TESTAR 7 DIAS GRÁTIS");
  assert.equal(conhecaSchema.safeParse({ ...CONHECA_DEFAULT, hero: { ...CONHECA_DEFAULT.hero, image_url: "http://x/a.jpg" } }).success, false);
  assert.equal(conhecaSchema.safeParse({ ...CONHECA_DEFAULT, hero: { ...CONHECA_DEFAULT.hero, image_url: "https://x/a.jpg" } }).success, true);
});
test("new modules: legacy content gets defaults and WhatsApp link carries message", async () => {
  const { whatsappLink } = await import("./conheca-content");
  const legado = { ...CONHECA_DEFAULT } as Record<string, unknown>; delete legado["features"]; delete legado["footer"]; delete legado["plans_section"];
  const r = resolveConheca(legado);
  assert.equal(r.features.items.length, 3);
  assert.equal(r.plans_section.featured_label, "MAIS COMPLETO");
  assert.equal(whatsappLink("55 (91) 99999-0000", "Olá"), "https://wa.me/5591999990000?text=Ol%C3%A1");
  assert.equal(conhecaSchema.safeParse({ ...CONHECA_DEFAULT, features: { ...CONHECA_DEFAULT.features, items: [] } }).success, false);
});
