import { test } from "node:test";
import assert from "node:assert/strict";
import { CONHECA_DEFAULT, resolveConheca } from "./conheca-content";

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
