import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync("public/vip-ponto.html", "utf8");
const source = html.slice(html.indexOf("function indicadoresDashboard("), html.indexOf("function painelExecutivoHTML("));
function indicators(hour: number, shifts: Record<string, number>, schedule: Record<string, string> = {}) {
  return JSON.parse(JSON.stringify(runInNewContext(`${source};indicadoresDashboard(fs,'2026-10-15',agora)`, {
    fs: [{ pin: "1", status: "Ativo" }, { pin: "2", status: "Ativo" }, { pin: "3", status: "Desligado" }],
    agora: { getHours: () => hour },
    get: () => [], pendentes: () => [], hhmm: () => `${hour}:00`, instanteBatida: () => ({civil:'2026-10-15'}),
    addDias: () => "2026-10-14",
    batidasDia: (pin: string, day: string) => Array(shifts[`${pin}|${day}`] || 0).fill({}),
    buscaNaEscala: (pin: string) => schedule[pin] ? { tipo: schedule[pin] } : null,
    previstoDia: (f: {pin:string}) => schedule[f.pin]==='DSR'?0:480,
    horarioEscala: () => null,
    toMin: (hour: string) => Number(hour.split(":")[0]) * 60,
  })));
}

test("manager counts incomplete pairs and excludes terminated employees", () => {
  assert.deepEqual(indicators(16, { "1|2026-10-15": 1, "2|2026-10-15": 4, "3|2026-10-15": 1 }),
    { marcacoes: 0, ocorrencias: 1, total: 2 });
});

test("previous-day incomplete pairs remain manager pending items", () => {
  const shifts = { "1|2026-10-14": 3 };
  assert.equal(indicators(5, shifts).ocorrencias, 1);
  assert.equal(indicators(6, shifts).ocorrencias, 1);
});

test("explicit DSR without punches is not pending but a missing worked shift is", () => {
  assert.equal(indicators(16, {}, { "1": "DSR", "2": "Trabalhado" }).ocorrencias, 1);
});