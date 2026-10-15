import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync("public/vip-ponto.html", "utf8");
const source = html.slice(html.indexOf("function indicadoresExecutivos("), html.indexOf("function painelExecutivoHTML("));
function indicators(hour: number, shifts: Record<string, number>, schedule: Record<string, string> = {}) {
  return JSON.parse(JSON.stringify(runInNewContext(`${source};indicadoresExecutivos(fs,'2026-10-15',agora)`, {
    fs: [{ pin: "1", status: "Ativo" }, { pin: "2", status: "Ativo" }, { pin: "3", status: "Desligado" }],
    agora: { getHours: () => hour },
    addDias: () => "2026-10-14",
    batidasDia: (pin: string, day: string) => Array(shifts[`${pin}|${day}`] || 0).fill({}),
    buscaNaEscala: (pin: string) => schedule[pin] ? { tipo: schedule[pin] } : null,
    previstoDia: () => 480,
  })));
}

test("live presence counts open shifts and excludes terminated employees", () => {
  assert.deepEqual(indicators(16, { "1|2026-10-15": 1, "2|2026-10-15": 4, "3|2026-10-15": 1 }),
    { presentes: 1, atencao: 1, folgas: 0, total: 2 });
});

test("before 06:00 an open previous-day shift remains present; afterwards it only needs attention", () => {
  const shifts = { "1|2026-10-14": 3 };
  assert.equal(indicators(5, shifts).presentes, 1);
  assert.equal(indicators(6, shifts).presentes, 0);
  assert.equal(indicators(6, shifts).atencao, 1);
});

test("explicit DSR is counted as rest and an explicit worked schedule is not", () => {
  assert.equal(indicators(16, {}, { "1": "DSR", "2": "Trabalhado" }).folgas, 1);
});