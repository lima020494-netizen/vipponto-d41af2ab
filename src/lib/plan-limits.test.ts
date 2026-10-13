import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../../public/vip-ponto.html", import.meta.url), "utf8");
const grab = (re: RegExp) => { const m = html.match(re); assert.ok(m); return m![0]; };
const ctx: Record<string, unknown> = {};
vm.runInNewContext(grab(/const PLANO_LIMITES=\{[^}]+\}/) + ";" + grab(/const limitePlano=[^;]+;/) + ";this.f=limitePlano;", ctx);
const lim = ctx["f"] as (p: number) => number;

test("Plano 1 permite 10 colaboradores", () => assert.equal(lim(1), 10));
test("Plano 2 permite 25 colaboradores", () => assert.equal(lim(2), 25));
test("Plano 3 permite 50 colaboradores", () => assert.equal(lim(3), 50));
test("escala trava após 30 dias", () => assert.match(html, /const ESC_TRAVA_DIAS=30;/));
