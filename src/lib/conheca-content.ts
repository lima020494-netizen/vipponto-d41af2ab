import { z } from "zod";

const plan = z.object({
  name: z.string().trim().min(1).max(40),
  price: z.string().trim().max(20).nullable(),
  caption: z.string().trim().max(120),
  benefits: z.array(z.string().trim().min(1).max(120)).max(8),
});
const imagem = z.string().max(900_000).refine((v) => v === "" || /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,/.test(v), "Imagem deve ser HTTPS ou arquivo PNG/JPG/WebP");
/** Módulo "Topo e chamada principal": textos ficam no nível raiz por compatibilidade; aqui ficam imagem e chamadas. */
export const heroModuleSchema = z.object({
  image_url: imagem,
  image_alt: z.string().trim().max(160),
  cta_primary: z.string().trim().min(1).max(40),
  cta_secondary: z.string().trim().min(1).max(40),
  highlights: z.array(z.string().trim().min(1).max(60)).max(3),
});
export type HeroModule = z.infer<typeof heroModuleSchema>;
export const HERO_DEFAULT: HeroModule = {
  image_url: "",
  image_alt: "Registro de ponto em um quiosque com impressora térmica",
  cta_primary: "TESTAR 7 DIAS GRÁTIS",
  cta_secondary: "FALAR NO WHATSAPP",
  highlights: ["7 dias de teste", "Dados isolados por conta"],
};
const curto = (n: number) => z.string().trim().max(n);
/** Módulo "Vantagens / Recursos". */
export const featuresModuleSchema = z.object({
  eyebrow: curto(60), title: curto(120),
  items: z.array(z.object({ title: z.string().trim().min(1).max(80), copy: curto(240) })).min(1).max(6),
});
export type FeaturesModule = z.infer<typeof featuresModuleSchema>;
export const FEATURES_DEFAULT: FeaturesModule = {
  eyebrow: "Do registro ao fechamento", title: "Tudo no ritmo da sua empresa.",
  items: [
    { title: "Sua jornada continua offline", copy: "Marcações guardadas no aparelho e sincronizadas quando a conexão retorna." },
    { title: "Comprovante na hora", copy: "Impressão térmica 58 mm com data, hora, NSR e hash de autenticidade." },
    { title: "Quiosques, tablets e PWA", copy: "Registro por PIN em terminais POS Android e acesso às folhas pelo celular." },
  ],
};
/** Módulo "Planos": textos da seção; os planos vêm da configuração de Planos e Preços. */
export const plansModuleSchema = z.object({ title: curto(120), subtitle: curto(200), featured_label: curto(30) });
export type PlansModule = z.infer<typeof plansModuleSchema>;
export const PLANS_MODULE_DEFAULT: PlansModule = { title: "O próximo passo da sua gestão.", subtitle: "Comece com 7 dias grátis. Escolha o plano para a sua rotina.", featured_label: "MAIS COMPLETO" };
/** Módulo "Rodapé e contato" (o número do WhatsApp fica no nível raiz). */
export const footerModuleSchema = z.object({ contact_title: curto(120), contact_text: curto(240), contact_cta: z.string().trim().min(1).max(40), whatsapp_message: curto(200), footer_text: curto(200) });
export type FooterModule = z.infer<typeof footerModuleSchema>;
export const FOOTER_DEFAULT: FooterModule = { contact_title: "Sua empresa merece uma gestão tranquila.", contact_text: "Tire suas dúvidas e encontre o plano para a sua operação.", contact_cta: "CHAMAR NO WHATSAPP", whatsapp_message: "Olá! Quero conhecer o Ponto Pro Gestão.", footer_text: "Desenhado em conformidade com as diretrizes da Portaria MTE 671/2021." };
export const conhecaSchema = z.object({
  hero: heroModuleSchema.default(HERO_DEFAULT),
  features: featuresModuleSchema.default(FEATURES_DEFAULT),
  plans_section: plansModuleSchema.default(PLANS_MODULE_DEFAULT),
  footer: footerModuleSchema.default(FOOTER_DEFAULT),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/),
  headline: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300),
  tagline: z.string().trim().max(120),
  plans: z.array(plan).length(3),
});
export type ConhecaContent = z.infer<typeof conhecaSchema>;

export const CONHECA_DEFAULT: ConhecaContent = {
  hero: HERO_DEFAULT,
  features: FEATURES_DEFAULT,
  plans_section: PLANS_MODULE_DEFAULT,
  footer: FOOTER_DEFAULT,
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
    hero: { ...content.hero, cta_primary: neutralCommercialText(content.hero.cta_primary), highlights: content.hero.highlights.map(neutralCommercialText) },
    features: { ...content.features, items: content.features.items.map((i) => ({ title: neutralCommercialText(i.title), copy: neutralCommercialText(i.copy) })) },
    footer: { ...content.footer, footer_text: neutralCommercialText(content.footer.footer_text), contact_text: neutralCommercialText(content.footer.contact_text) },
    plans: content.plans.map((plan) => ({ ...plan, name: neutralCommercialText(plan.name), caption: neutralCommercialText(plan.caption), benefits: plan.benefits.map(neutralCommercialText) })),
  };
}

/** Link do WhatsApp com mensagem inicial opcional. */
export const whatsappLink = (numero: string, mensagem = "") => `https://wa.me/${numero.replace(/\D/g, "")}${mensagem.trim() ? `?text=${encodeURIComponent(mensagem.trim())}` : ""}`;
