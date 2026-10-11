import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

test("dismissal persists for the current company without hiding another company's first steps", () => {
  const source = readFileSync("public/vip-ponto.html", "utf8");
  const start = source.indexOf("function primeirosPassosVisiveis()");
  const end = source.indexOf("function primeirosPassosHTML()", start);
  const storage = new Map<string, string>();
  const context = { CONTA: "empresa-a", K: (key: string) => `${context.CONTA}:${key}`, localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) }, $: () => ({ remove() {} }) };
  const visible = () => runInNewContext(`${source.slice(start, end)}; primeirosPassosVisiveis()`, context);
  assert.equal(visible(), true);
  runInNewContext(`${source.slice(start, end)}; dispensarPrimeirosPassos()`, context);
  assert.equal(visible(), false);
  context.CONTA = "empresa-b";
  assert.equal(visible(), true);
});