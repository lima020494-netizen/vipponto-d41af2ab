import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

process.env["TZ"] = "America/Sao_Paulo";

function jornada(rows: [string, string, string, string][], dia: string, explicit=false, early=false) {
  const source = readFileSync("public/vip-ponto.html", "utf8");
  const start = source.indexOf("function instanteBatida");
  const end = source.indexOf("\n", source.indexOf("function batidasJornada"));
  const batidas = rows.map(([data, hora, nsr, criadoEm]) => ({ pin: "1", data, hora, nsr, criadoEm, jornada:explicit?data:undefined }));
  const helpers = `const pad=n=>String(n).padStart(2,'0');const isoOf=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const hhmm=d=>pad(d.getHours())+':'+pad(d.getMinutes());const toMin=h=>{if(!h)return 0;const [a,b]=h.split(':').map(Number);return a*60+(b||0);};
const addDias=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return isoOf(d);};const horarioEscala=()=>${early?'"00:00"':'null'};const get=()=>batidas;`;
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

test('00:21 exit follows previous-day 16:00 even when cached jornada equals civil date',()=>{
  const rows:[string,string,string,string][]=[['2026-10-30','16:00','1','2026-10-30T19:00:00Z'],['2026-10-31','00:21','2','2026-10-31T03:21:00Z']];
  assert.deepEqual(jornada(rows,'2026-10-30',true),['16:00','00:21']);assert.deepEqual(jornada(rows,'2026-10-31',true),[]);
});
test('scheduled midnight start stays on its civil day',()=>{
  const rows:[string,string,string,string][]=[['2026-10-30','16:00','1','2026-10-30T19:00:00Z'],['2026-10-31','00:21','2','2026-10-31T03:21:00Z']];
  assert.deepEqual(jornada(rows,'2026-10-31',false,true),['00:21']);
});
test('legacy overnight timestamp order uses Belem even on a UTC device',()=>{
  const previous=process.env['TZ'];process.env['TZ']='UTC';
  try {assert.deepEqual(jornada([['2026-10-30','00:21','2','2026-10-31T03:21:00Z'],['2026-10-30','16:00','1','2026-10-30T19:00:00Z']],'2026-10-30'),['16:00','00:21']);}
  finally{process.env['TZ']=previous;}
});

test("16:00 entry with 00:27 exit on the next civil day closes the previous shift", () => {
  const rows: [string, string, string, string][] = [
    ["2026-10-13", "16:00", "000000300", "2026-10-13T19:00:00Z"],
    ["2026-10-14", "00:27", "000000301", "2026-10-14T03:27:00Z"],
  ];
  assert.deepEqual(jornada(rows, "2026-10-13"), ["16:00", "00:27"]);
  assert.deepEqual(jornada(rows, "2026-10-14"), []);
});
