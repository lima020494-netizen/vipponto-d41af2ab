import { test } from 'node:test';
import assert from 'node:assert/strict';
import { androidDownloadResponse } from './android-download';

test('APK redirects directly to the authorized GitHub v1.0.0 release', () => {
  const response = androidDownloadResponse();
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://github.com/lima020494-netizen/pontoprogestao/releases/download/v1.0.0/Ponto-pro-gestao.apk');
});