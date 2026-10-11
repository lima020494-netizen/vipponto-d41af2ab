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
  headline: "Ponto eletrônico para quiosques, tablets e terminais POS Android",
  subtitle: "Ponto Pro Gestão: desenhado em conformidade com as diretrizes da Portaria MTE 671/2021. Funciona offline, com comprovante e relatórios.",
  plans: [
    { name: "Básico", price: "49", caption: "Para começar com segurança", benefits: ["Registro de ponto por PIN", "Funcionamento offline", "Comprovante de ponto", "Folhas e relatórios"] },
    { name: "Pro", price: "89", caption: "Mais gestão para sua rotina", benefits: ["Recursos do Básico", "Gestão de escalas", "Banco de horas", "Pacote do contador"] },
    { name: "Enterprise", price: null, caption: "Uma operação do seu tamanho", benefits: ["Recursos do Pro", "Atendimento à sua operação", "Condições personalizadas", "Suporte dedicado"] },
  ],
};

/** Neutralizes legacy commercial wording without mutating stored configuration. */
export function neutralCommercialText(text: string): string {
  return text
    .replace(/\bSUNMI(?:\s+D2\s+Mini)?\b/gi, "Terminais POS Android")
    .replace(/\bAtalaia(?:\s+VIP(?:\s+Lounge)?|\s+Sistemas)?\b/gi, "Ponto Pro Gestão")
    .replace(/(?:100%\s+conforme|(?:em\s+)?conforme\s+(?:a\s+)?Portaria\s+(?:MTE\s+)?671\/2021(?:\s+MTE)?|homologad[oa](?:\s+oficialmente)?(?:\s+(?:pelo\s+MTE|pela\s+Portaria\s+(?:MTE\s+)?671\/2021))?)/gi, "desenhado em conformidade com as diretrizes da Portaria MTE 671/2021");
}

/** Invalid/missing data falls back to defaults; legacy public wording stays neutral. */
export function resolveConheca(raw: unknown): ConhecaContent {
  const p = conhecaSchema.safeParse(raw);
  const content = p.success ? p.data : CONHECA_DEFAULT;
  return {
    ...content,
    headline: neutralCommercialText(content.headline),
    subtitle: neutralCommercialText(content.subtitle),
    tagline: neutralCommercialText(content.tagline),
    plans: content.plans.map((plan) => ({ ...plan, name: neutralCommercialText(plan.name), caption: neutralCommercialText(plan.caption), benefits: plan.benefits.map(neutralCommercialText) })),
  };
}
