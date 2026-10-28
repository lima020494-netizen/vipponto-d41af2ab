import { z } from "zod";
import { developerInfoSchema } from "./developer-info";
import { resolvePlatformLogo } from "./platform-identity";

const publicLogo = z.string().max(1400000).refine(v => v === "" || /^https:\/\//.test(v) || /^\/__l5e\/assets-v1\/[A-Za-z0-9/_ .-]+$/.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v), "Use uma imagem HTTPS ou PNG/JPG/WebP.");
export const appSettingsSchema = z.object({
  app_name: z.string().trim().min(1).max(80),
  logo_url: publicLogo,
  primary_color: z.string().regex(/^#[0-9a-f]{6}$/i),
  accent_color: z.string().regex(/^#[0-9a-f]{6}$/i),
  text_color: z.string().regex(/^#[0-9a-f]{6}$/i).default("#12203a"),
  version: z.string().trim().min(1).max(30),
  maintenance: z.boolean(),
  developer: developerInfoSchema,
});
export type AppSettings = z.infer<typeof appSettingsSchema>;
export const APP_SETTINGS_DEFAULT: AppSettings = {
  app_name: "Ponto Pro Gestão", logo_url: "", primary_color: "#1e3a8a", accent_color: "#0ea5e9", text_color: "#12203a", version: "1.0.0", maintenance: false,
  developer: { nome: "Henrique Lima", empresa: "Ponto Pro Gestão", tipoDoc: "CPF", doc: "", email: "", telefone: "", cidade: "Salinópolis-PA", versao: "1.0.0", registroINPI: "" },
};
export function resolveAppSettings(raw: unknown): AppSettings {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const parsed = appSettingsSchema.safeParse({ ...APP_SETTINGS_DEFAULT, ...input, developer: { ...APP_SETTINGS_DEFAULT.developer, ...(input["developer"] as object ?? {}) } });
  if (!parsed.success) return APP_SETTINGS_DEFAULT;
  return { ...parsed.data, logo_url: resolvePlatformLogo(parsed.data.logo_url) };
}