import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const html=readFileSync('public/vip-ponto.html','utf8');
const source=html.slice(html.indexOf('function contextoSuporteGestor('),html.indexOf('function abrirQuiosque('));
test('support carries company and manager details, never credentials',()=>{
  const result=runInNewContext(source+';contextoSuporteGestor()', {get:()=>({fantasia:'Empresa Teste',doc:'12.345.678/0001-90'}),GERENCIADOR:{nome:'Henrique',pin:'9876'}});
  assert.equal(result,'Empresa: Empresa Teste\nCPF/CNPJ: 12.345.678/0001-90\nGestor: Henrique');
});