import { z } from "zod";

const plan = z.object({
  name: z.string().trim().min(1).max(40),
  price: z.string().trim().max(20).nullable(),
  caption: z.string().trim().max(120),
  benefits: z.array(z.string().trim().min(1).max(120)).max(8),
});
export const conhecaSchema = z.object({
  whatsapp: z.string().trim().regex(/^\d{10,15}$/),
  headline: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300),
  tagline: z.string().trim().max(120),
  plans: z.array(plan).length(3),
});
export type ConhecaContent = z.infer<typeof conhecaSchema>;

export const CONHECA_DEFAULT: ConhecaContent = {
  whatsapp: "5591999999999",
  tagline: "Jornada registrada. Gestão tranquila.",
  headline: "O Ponto Eletrônico Seguro para Kiosk, Sunmi e PWA - Conforme Portaria 671/2021 MTE",
  subtitle: "Gestão de ponto simples, segura e 100% conforme. Funciona offline, com comprovante e relatórios.",
  plans: [
    { name: "Básico", price: "49", caption: "Para começar com segurança", benefits: ["Registro de ponto por PIN", "Funcionamento offline", "Comprovante de ponto", "Folhas e relatórios"] },
    { name: "Pro", price: "89", caption: "Mais gestão para sua rotina", benefits: ["Recursos do Básico", "Gestão de escalas", "Banco de horas", "Pacote do contador"] },
    { name: "Enterprise", price: null, caption: "Uma operação do seu tamanho", benefits: ["Recursos do Pro", "Atendimento à sua operação", "Condições personalizadas", "Suporte dedicado"] },
  ],
};

/** Merges stored content with defaults; invalid/missing data falls back to defaults. */
export function resolveConheca(raw: unknown): ConhecaContent {
  const p = conhecaSchema.safeParse(raw);
  return p.success ? p.data : CONHECA_DEFAULT;
}
