import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { canSaveDeveloperInfo, developerInfoSchema } from "./developer-info";

describe("Global developer information permissions", () => {
  test("only Henrique's authenticated master account with admin role and PIN can save", () => {
    assert.equal(canSaveDeveloperInfo("lima020494@gmail.com", true, "1000"), true);
    assert.equal(canSaveDeveloperInfo("cliente@example.com", true, "1000"), false);
    assert.equal(canSaveDeveloperInfo("lima020494@gmail.com", false, "1000"), false);
    assert.equal(canSaveDeveloperInfo("lima020494@gmail.com", true, "1234"), false);
  });
  test("logo accepts raster data only, not executable SVG", () => {
    const profile = { nome: "Henrique", empresa: "Atalaia", tipoDoc: "CPF", doc: "", email: "", telefone: "", cidade: "", versao: "1", registroINPI: "" };
    assert.equal(developerInfoSchema.safeParse({ ...profile, logo: "data:image/png;base64,YWJj" }).success, true);
    assert.equal(developerInfoSchema.safeParse({ ...profile, logo: "data:image/svg+xml;base64,YWJj" }).success, false);
  });
});