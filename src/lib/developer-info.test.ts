import { describe, expect, test } from "bun:test";
import { canSaveDeveloperInfo, developerInfoSchema } from "./developer-info";

describe("Global developer information permissions", () => {
  test("only Henrique's authenticated master account with admin role and PIN can save", () => {
    expect(canSaveDeveloperInfo("lima020494@gmail.com", true, "1000")).toBe(true);
    expect(canSaveDeveloperInfo("cliente@example.com", true, "1000")).toBe(false);
    expect(canSaveDeveloperInfo("lima020494@gmail.com", false, "1000")).toBe(false);
    expect(canSaveDeveloperInfo("lima020494@gmail.com", true, "1234")).toBe(false);
  });
  test("logo accepts raster data only, not executable SVG", () => {
    const profile = { nome: "Henrique", empresa: "Atalaia", tipoDoc: "CPF", doc: "", email: "", telefone: "", cidade: "", versao: "1", registroINPI: "" };
    expect(developerInfoSchema.safeParse({ ...profile, logo: "data:image/png;base64,YWJj" }).success).toBe(true);
    expect(developerInfoSchema.safeParse({ ...profile, logo: "data:image/svg+xml;base64,YWJj" }).success).toBe(false);
  });
});