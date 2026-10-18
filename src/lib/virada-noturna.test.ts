import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

process.env["TZ"] = "America/Sao_Paulo";

function jornada(rows: [string, string, string, string][], dia: string) {
  const source = readFileSync("public/vip-ponto.html", "utf8");
  const start = source.indexOf("function instanteBatida");
  const end = source.indexOf("\n", source.indexOf("function batidasJornada"));
  const batidas = rows.map(([data, hora, nsr, criadoEm]) => ({ pin: "1", data, hora, nsr, criadoEm }));
  const timezone = source.slice(source.indexOf("const FUSO_PONTO="),source.indexOf("const toMin ="));
  const helpers = `const pad=n=>String(n).padStart(2,'0');${timezone}const toMin=h=>{if(!h)return 0;const [a,b]=h.split(':').map(Number);return a*60+(b||0);};
const addDias=(iso,n)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};const horarioEscala=()=>null;const get=()=>batidas;`;
  return runInNewContext(`${helpers}${source.slice(start, end)}; batidasJornada('1', '${dia}').map(b=>b.hora)`, { batidas }) as string[];
}

test("legacy after-midnight exit stored with the shift date stays last, in punch order", () => {
  const rows: [string, string, string, string][] = [
    ["2026-10-09", "00:23", "000000142", "2026-10-10T03:23:18Z"],
    ["2026-10-09", "16:26", "000000133", "2026-10-09T19:26:08Z"],
    ["2026-10-09", "22:15", "000000139", "2026-10-10T01:15:28Z"],
    ["2026-10-09", "22:59", "000000140", "2026-10-10T01:59:45Z"],
  ];
  assert.deepEqual(jornada(rows, "2026-10-09"), ["16:26", "22:15", "22:59", "00:23"]);
});

test("16:00 entry with 00:27 exit on the next civil day closes the previous shift", () => {
  const rows: [string, string, string, string][] = [
    ["2026-10-13", "16:00", "000000300", "2026-10-13T19:00:00Z"],
    ["2026-10-14", "00:27", "000000301", "2026-10-14T03:27:00Z"],
  ];
  assert.deepEqual(jornada(rows, "2026-10-13"), ["16:00", "00:27"]);
  assert.deepEqual(jornada(rows, "2026-10-14"), []);
});
