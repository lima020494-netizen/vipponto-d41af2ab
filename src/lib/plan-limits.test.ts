import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PLANOS_PADRAO, resolvePlanos } from "./plans.ts";

const html = readFileSync(new URL("../../public/vip-ponto.html", import.meta.url), "utf8");

test("Plano 1 permite 10 colaboradores", () => assert.equal(PLANOS_PADRAO["1"].colaboradores, 10));
test("Plano 2 permite 25 colaboradores", () => assert.equal(PLANOS_PADRAO["2"].colaboradores, 25));
test("Plano 3 permite 50 colaboradores", () => assert.equal(PLANOS_PADRAO["3"].colaboradores, 50));
test("fallback do app mantém 10/25/50 sem configuração salva", () => {
  assert.match(html, /const PLANO_LIMITES=\{1:10,2:25,3:50\}/);
});
test("escala trava após 30 dias", () => assert.match(html, /const ESC_TRAVA_DIAS=30;/));

test("configuração salva substitui os limites padrão dinamicamente", () => {
  const p = resolvePlanos({ "1": { nome: "Start", empresas: 1, colaboradores: 5, mensal: 39, anual: null, recursos: ["Folha MTE"], ativo: true } });
  assert.equal(p["1"]?.colaboradores, 5);
  assert.equal(p["1"]?.nome, "Start");
  assert.equal(p["2"]?.colaboradores, 25); // não configurado: mantém padrão
});
test("entrada inválida é ignorada e o padrão prevalece", () => {
  const p = resolvePlanos({ "2": { nome: "", colaboradores: -3 } });
  assert.equal(p["2"]?.colaboradores, 25);
  assert.equal(p["2"]?.ativo, true);
});
test("plano inativo não é oferecido no app", () => {
  assert.match(html, /filter\(p=>pcs\[p\]\?\.ativo!==false\)/);
});
