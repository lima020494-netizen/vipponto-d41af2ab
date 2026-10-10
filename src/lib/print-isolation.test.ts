import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('A4 printing invokes only the isolated document window, never the kiosk window', async () => {
  const source = readFileSync('public/vip-ponto.html', 'utf8');
  const start = source.indexOf('function imprimirArea(');
  const end = source.indexOf('/* ============================== MÓDULO 4', start);
  let parentPrints = 0;
  let documentPrints = 0;
  let removed = false;
  let afterPrint: (() => void) | undefined;
  const frame = {
    style: { cssText: '' }, id: '', title: '', srcdoc: '', onload: async () => {},
    remove: () => { removed = true; },
    contentDocument: { images: [], fonts: { ready: Promise.resolve() } },
    contentWindow: {
      focus: () => {}, print: () => { documentPrints += 1; },
      requestAnimationFrame: (callback: () => void) => callback(),
      addEventListener: (_name: string, callback: () => void) => { afterPrint = callback; },
    },
  };
  const sandbox = {
    CONTA: 'preview', $: () => null, esc: (s: string) => s,
    location: { origin: 'http://localhost:8080' },
    window: { print: () => { parentPrints += 1; } },
    document: { createElement: () => frame, querySelectorAll: () => [], body: { appendChild: () => {} } },
  };
  runInNewContext(`${source.slice(start, end)}; imprimirArea('data-doc-completo', 'Folha MTE');`, sandbox);
  await frame.onload();
  assert.equal(documentPrints, 1);
  assert.equal(parentPrints, 0);
  assert.equal(removed, false, 'print document must remain alive until the print dialog closes');
  assert.ok(afterPrint);
  afterPrint();
  assert.equal(removed, true);
});