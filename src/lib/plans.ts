import { z } from "zod";

/** Definição dinâmica de um plano comercial (nome, preços, limites, recursos e status). */
export const planoSchema = z.object({
  nome: z.string().trim().min(1).max(40),
  empresas: z.number().int().min(1).max(20),
  colaboradores: z.number().int().min(1).max(500),
  gerenciadores: z.number().int().min(1).max(100).default(4),
  mensal: z.number().nonnegative().nullable(),
  anual: z.number().nonnegative().nullable(),
  recursos: z.array(z.string().trim().min(1).max(80)).max(8),
  ativo: z.boolean(),
});
export const planosSchema = z.record(z.string(), planoSchema);
export type PlanoCfg = z.infer<typeof planoSchema>;

const RECURSOS_PADRAO = ["Folha MTE, AFD e banco de horas", "Operação offline com sincronização", "Comprovante térmico e PDF oficial"];

/** Valores atuais como padrão: o app funciona mesmo sem configuração salva. */
export const PLANOS_PADRAO: Record<string, PlanoCfg> = {
  "1": { nome: "Essencial", empresas: 1, colaboradores: 10, gerenciadores: 4, mensal: null, anual: null, recursos: RECURSOS_PADRAO, ativo: true },
  "2": { nome: "Profissional", empresas: 2, colaboradores: 25, gerenciadores: 4, mensal: null, anual: null, recursos: RECURSOS_PADRAO, ativo: true },
  "3": { nome: "Multiempresa", empresas: 3, colaboradores: 50, gerenciadores: 4, mensal: null, anual: null, recursos: RECURSOS_PADRAO, ativo: true },
};

/** Mescla a configuração salva (app_config chave 'planos') com os padrões, ignorando entradas inválidas. */
export function resolvePlanos(stored: unknown): Record<string, PlanoCfg> {
  const out: Record<string, PlanoCfg> = { ...PLANOS_PADRAO };
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const [k, v] of Object.entries(stored as Record<string, unknown>)) {
      const p = planoSchema.safeParse(v);
      if (p.success) out[k] = p.data;
    }
  }
  return out;
}
