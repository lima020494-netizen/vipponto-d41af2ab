import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
const html = readFileSync('public/vip-ponto.html','utf8');
test('Bluetooth receipt sends ESC/POS in chunks no larger than 20 bytes without browser print', async()=>{
  const calls: number[][]=[];
  const code=html.slice(html.indexOf('async function imprimirBluetooth('),html.indexOf('let ULTIMO_COMPROVANTE'));
  await runInNewContext(code+';imprimirBluetooth(["receipt"])',{
    BT_IMPRESSORA:{caracteristica:{properties:{writeWithoutResponse:true},writeValueWithoutResponse:async(b:Uint8Array)=>calls.push([...b])}},
    escposComprovante:()=>Buffer.from([27,64,...Array(45).fill(65)]).toString('base64'),atob,Uint8Array,
    window:{print:()=>{throw new Error('Unexpected browser printing');}},
  });
  assert.deepEqual(calls.map(c=>c.length),[20,20,7]);assert.deepEqual(calls[0]?.slice(0,2),[27,64]);
});
test('disconnected Bluetooth refuses printing rather than opening Android print',async()=>{
  const code=html.slice(html.indexOf('async function imprimirBluetooth('),html.indexOf('let ULTIMO_COMPROVANTE'));
  await assert.rejects(runInNewContext(code+';imprimirBluetooth([])',{BT_IMPRESSORA:{caracteristica:null}}),/Bluetooth desconectado/);
});