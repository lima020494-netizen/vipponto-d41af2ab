import { z } from "zod";

export const MASTER_EMAIL = "lima020494@gmail.com";
export const developerInfoSchema = z.object({
  nome: z.string().trim().max(120), empresa: z.string().trim().max(120),
  tipoDoc: z.string().trim().max(20), doc: z.string().trim().max(30),
  email: z.string().trim().max(160), telefone: z.string().trim().max(40),
  cidade: z.string().trim().max(120), versao: z.string().trim().max(30),
  registroINPI: z.string().trim().max(120),
  logo: z.string().max(1400000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).optional(),
});

export function canSaveDeveloperInfo(email: string, isAdmin: boolean, pin: string) {
  return email.toLowerCase() === MASTER_EMAIL && isAdmin && pin === "1000";
}