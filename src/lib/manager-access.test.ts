import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html=readFileSync(new URL("../../public/vip-ponto.html",import.meta.url),"utf8");
function managerContext(mode: boolean, count=0) {
  const stored={gerenciadores:[{pin:"1000",is_hidden:true},...Array.from({length:count},(_,i)=>({pin:String(2000+i)}))],funcionarios:[]};
  const fields: Record<string,{value:string;innerHTML:string}>=Object.fromEntries([['g-nome','Gestor'],['g-funcao','Gerente'],['g-pin','5678'],['g-msg','']].map(([id,value])=>[id,{value:value??'',innerHTML:''}]));
  const ctx={MODO_GESTOR:mode,CONTA:'test@example.com',LIC:{licenca:{plano:1},config:{planos:{1:{gerenciadores:2}}}},licCache:()=>null,planosCfg:(l: {config: {planos:object}})=>l.config.planos,get:(k:keyof typeof stored)=>stored[k],set:(k:keyof typeof stored,v:never)=>{stored[k]=v;},$: (id:string)=>fields[id],log:()=>{},renderGerenciadores:()=>{},abrirPinModal:()=>{ctx.opened=true;},opened:false};
  const extract=(start:string,end:string)=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));
  runInNewContext(extract('const gerVisiveis=','function renderGerenciadores()')+extract('function maxGerAtual()','function maxFuncAtual()')+extract('function addGerenciador()','function editarGer(')+extract('function pedirPinGestor()','function pedirPinPortal()'),ctx);
  return {ctx,stored,fields};
}
test('kiosk cannot open the manager PIN entry',()=>{const {ctx}=managerContext(false);runInNewContext('pedirPinGestor()',ctx);assert.equal(ctx.opened,false);});
test('manager mode with authenticated account requests a PIN',()=>{const {ctx}=managerContext(true);runInNewContext('pedirPinGestor()',ctx);assert.equal(ctx.opened,true);});
test('hidden reserve is excluded from the contracted manager capacity',()=>{const {ctx,stored}=managerContext(true,1);runInNewContext('addGerenciador()',ctx);assert.equal(stored.gerenciadores.length,3);});
test('registration is refused once two contracted managers exist',()=>{const {ctx,stored}=managerContext(true,2);runInNewContext('addGerenciador()',ctx);assert.equal(stored.gerenciadores.length,3);});