import { z } from "zod";
import { developerInfoSchema } from "./developer-info";

const publicLogo = z.string().max(1400000).refine(v => v === "" || /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v), "Use uma imagem HTTPS ou PNG/JPG/WebP.");
export const appSettingsSchema = z.object({
  app_name: z.string().trim().min(1).max(80),
  logo_url: publicLogo,
  primary_color: z.string().regex(/^#[0-9a-f]{6}$/i),
  accent_color: z.string().regex(/^#[0-9a-f]{6}$/i),
  version: z.string().trim().min(1).max(30),
  maintenance: z.boolean(),
  developer: developerInfoSchema,
});
export type AppSettings = z.infer<typeof appSettingsSchema>;
export const APP_SETTINGS_DEFAULT: AppSettings = {
  app_name: "Ponto Pro Gestão", logo_url: "", primary_color: "#0c2246", accent_color: "#c9992b", version: "1.0.0", maintenance: false,
  developer: { nome: "Henrique Lima", empresa: "Ponto Pro Gestão", tipoDoc: "CPF", doc: "", email: "", telefone: "", cidade: "Salinópolis-PA", versao: "1.0.0", registroINPI: "" },
};
export function resolveAppSettings(raw: unknown): AppSettings {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const parsed = appSettingsSchema.safeParse({ ...APP_SETTINGS_DEFAULT, ...input, developer: { ...APP_SETTINGS_DEFAULT.developer, ...(input["developer"] as object ?? {}) } });
  return parsed.success ? parsed.data : APP_SETTINGS_DEFAULT;
}