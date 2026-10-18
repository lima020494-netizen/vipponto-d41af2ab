import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const html=readFileSync('public/vip-ponto.html','utf8');
const helpers=html.slice(html.indexOf('const FUSO_PONTO='),html.indexOf('function toast('));
test('Belém civil time and calendar ignore device timezone',()=>{
 for(const zone of ['UTC','Asia/Tokyo','America/Los_Angeles']){
  process.env['TZ']=zone;
  const r=runInNewContext(`const pad=n=>String(n).padStart(2,'0');${helpers};[isoOf(new Date('2026-10-18T02:30:00Z')),hhmm(new Date('2026-10-18T02:30:00Z')),horaPonto(new Date('2026-10-18T08:59:00Z')),dow('2026-10-18'),addDias('2026-12-31',1)]`);
  assert.deepEqual(Array.from(r),['2026-10-17','23:30',5,0,'2027-01-01']);
 }
});
test('no camera or denied permission keeps PIN without requesting video',()=>{
 const s=html.slice(html.indexOf('function capacidadesCamera()'),html.indexOf('function privacidadePonto()'));
 for(const navigator of [{},{mediaDevices:{getUserMedia:()=>{throw Error('Permission denied');}}}]) assert.equal(runInNewContext(`${s};capacidadesCamera()`,{navigator}).metodo,'PIN');
});
test('contingency identifiers are unique across devices, not fiscal NSRs',()=>{
 const s=html.slice(html.indexOf('function proximoNSR()'),html.indexOf('async function centralizarBatida('));
 const ids=new Set(runInNewContext(`${s};Array.from({length:100},()=>proximoNSR())`,{crypto}));
 assert.equal(ids.size,100);assert.ok([...ids].every(id=>String(id).startsWith('P-')));
});
test('fiscal export refuses pending NSRs and accepts historical official numbers',()=>{
 const s=html.slice(html.indexOf('function exigirNSROficial('),html.indexOf('function confirmarMarcacaoRecente('));
 assert.throws(()=>runInNewContext(`${s};exigirNSROficial('2026-10-01','2026-10-31')`,{get:()=>[{data:'2026-10-18',nsr:'P-abc',nsrPendente:true}]}),/contingência/);
 assert.doesNotThrow(()=>runInNewContext(`${s};exigirNSROficial('2026-10-01','2026-10-31')`,{get:()=>[{data:'2026-10-18',nsr:'000000142'}]}));
});
test('failed allocation retains the complete offline punch',async()=>{
 const s=html.slice(html.indexOf('let SINC=false;'),html.indexOf('function filaPonto('));let removed=false;
 const b={nsr:'P-abc',eventoId:'abc',nsrPendente:true,pin:'1234',data:'2026-10-18',hora:'08:00'};
 const r=await runInNewContext(`${s};sincronizarPendentes()`,{sb:{},CONTA:'test',filaListar:async()=>[b],pendentesLS:()=>[],get:()=>[b],centralizarBatida:async()=>{throw Error('Not enabled');},filaRemover:async()=>{removed=true;},NUVEM_OK:true});
 assert.equal(r,0);assert.equal(removed,false);assert.equal(b.hora,'08:00');
});
test('central response replaces only matching pending ID and clears its queue',async()=>{
 const s=html.slice(html.indexOf('let SINC=false;'),html.indexOf('function filaPonto('));
 let rows=[{nsr:'P-abc',eventoId:'abc',nsrPendente:true,hora:'08:00'},{nsr:'000000142',hora:'16:00'}];let removed:string[]=[];
 const r=await runInNewContext(`${s};sincronizarPendentes()`,{sb:{},CONTA:'test',filaListar:async()=>[rows[0]],pendentesLS:()=>[],get:()=>rows,set:(_k:string,v:typeof rows)=>{rows=v;},centralizarBatida:async(b:object)=>({...b,nsr:'000000143',nsrPendente:false}),filaRemover:async(ids:string[])=>{removed=ids;},salvaPendentes:()=>{},NUVEM_OK:false});
 assert.equal(r,1);assert.equal(rows[0]?.nsr,'000000143');assert.equal(rows[0]?.hora,'08:00');assert.equal(rows[1]?.nsr,'000000142');assert.deepEqual(Array.from(removed),['P-abc']);
});
