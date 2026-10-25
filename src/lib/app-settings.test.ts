import { test } from "node:test";
import assert from "node:assert/strict";
import { appSettingsSchema, resolveAppSettings } from "./app-settings";
import { canSaveDeveloperInfo } from "./developer-info";

test("global identity preserves configured logo, version and maintenance", () => {
  const s = resolveAppSettings({logo_url:"https://example.com/logo.png",version:"4.0",maintenance:true});
  assert.equal(s.logo_url,"https://example.com/logo.png"); assert.equal(s.version,"4.0"); assert.equal(s.maintenance,true);
});
test("logo rejects script protocols and SVG content", () => {
  assert.equal(appSettingsSchema.safeParse({...resolveAppSettings(null),logo_url:"javascript:alert(1)"}).success,false);
  assert.equal(appSettingsSchema.safeParse({...resolveAppSettings(null),logo_url:"data:image/svg+xml;base64,AAAA"}).success,false);
});
test("global settings authorization requires master plus admin plus reserve confirmation", () => {
  assert.equal(canSaveDeveloperInfo("pontoprogestao@gmail.com",true,"1000"),true);
  assert.equal(canSaveDeveloperInfo("other@example.com",true,"1000"),false);
  assert.equal(canSaveDeveloperInfo("pontoprogestao@gmail.com",false,"1000"),false);
  assert.equal(canSaveDeveloperInfo("pontoprogestao@gmail.com",true,"1234"),false);
});