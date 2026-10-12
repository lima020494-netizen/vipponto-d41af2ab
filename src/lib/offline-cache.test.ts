import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('offline cache never intercepts account, API, auth or database responses', () => {
  const handlers = new Map<string, (event: any) => void>();
  const context = {
    URL,
    self: { location: { origin: 'https://preview.example' }, addEventListener: (name: string, handler: (event: any) => void) => handlers.set(name, handler) },
    caches: { open: async () => ({ match: async () => ({ cached: true }) }) },
  };
  runInNewContext(readFileSync('public/ponto-offline-sw.js', 'utf8'), context);
  const handler = handlers.get('fetch');
  assert.ok(handler);
  for (const url of ['https://preview.example/api/public/licenca', 'https://preview.example/api/public/folha-link', 'https://database.example/rest/v1/pontos', 'https://database.example/auth/v1/token']) {
    let intercepted = false;
    handler({ request: { method: 'GET', url }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false, url);
  }
  let scriptIntercepted = false;
  handler({ request: { method: 'GET', url: 'https://preview.example/jspdf-2.5.1.umd.min.js' }, respondWith: () => { scriptIntercepted = true; } });
  assert.equal(scriptIntercepted, true);
});