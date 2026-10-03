import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const DAY = 86400000;
const TOLERANCIA_DIAS = 7;
const TERMOS_VERSAO = "1.0";
const DEV_EMAIL = "lima020494@gmail.com";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store, private" } });
}

type Lic = { email_dono: string; status: string; plano: number; data_vencimento: string; tipo_pagamento: string; valor_mensal: number | null; aceite_termos: unknown; observacao: string | null };

/** Estado efetivo: trial | ativo | tolerancia | bloqueado | cortesia */
function estado(l: Lic) {
  if (l.status === "cortesia") return "cortesia";
  if (l.status === "bloqueado") return "bloqueado";
  const venc = new Date(l.data_vencimento).getTime();
  if (Date.now() <= venc) return l.status === "trial" ? "trial" : "ativo";
  if (Date.now() <= venc + TOLERANCIA_DIAS * DAY) return "tolerancia";
  return "bloqueado";
}
const view = (l: Lic) => ({ ...l, estado: estado(l), carencia_ate: new Date(new Date(l.data_vencimento).getTime() + TOLERANCIA_DIAS * DAY).toISOString() });

async function auth(request: Request) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearer) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(bearer);
  const email = data.user?.email?.toLowerCase();
  if (error || !data.user || !email) return null;
  let { data: role } = await supabaseAdmin.from("user_roles" as never).select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
  if (!role && email === DEV_EMAIL && data.user.email_confirmed_at) {
    await supabaseAdmin.from("user_roles" as never).insert({ user_id: data.user.id, role: "admin" } as never);
    role = { role: "admin" } as never;
  }
  return { db: supabaseAdmin, user: data.user, email, isDev: !!role };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getConfig(db: any) {
  const { data } = await db.from("app_config" as never).select("valor").eq("chave", "cobranca").maybeSingle();
  return ((data as { valor?: unknown } | null)?.valor as Record<string, unknown>) || {};
}

const adminSchema = z.discriminatedUnion("acao", [
  z.object({ acao: z.literal("listar"), pin: z.string() }),
  z.object({ acao: z.literal("renovar"), pin: z.string(), email: z.string().email(), dias: z.union([z.literal(30), z.literal(365)]) }),
  z.object({ acao: z.literal("cortesia"), pin: z.string(), email: z.string().email() }),
  z.object({ acao: z.literal("bloquear"), pin: z.string(), email: z.string().email() }),
  z.object({ acao: z.literal("plano"), pin: z.string(), email: z.string().email(), plano: z.number().int().min(1).max(3) }),
  z.object({ acao: z.literal("config"), pin: z.string(), pix: z.string().max(140), whatsapp: z.string().max(40),
    precos: z.record(z.string(), z.number().nonnegative().nullable()), precosAnuais: z.record(z.string(), z.number().nonnegative().nullable()) }),
]);

export const Route = createFileRoute("/api/public/licenca")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const a = await auth(request);
        if (!a) return json({ error: "Sessão inválida." }, 401);
        let { data: lic } = await a.db.from("licencas" as never).select("*").eq("email_dono", a.email).maybeSingle();
        if (!lic) {
          const ins = await a.db.from("licencas" as never).insert({ email_dono: a.email, user_id: a.user.id, status: "trial", plano: 1,
            data_vencimento: new Date(Date.now() + 7 * DAY).toISOString() } as never).select("*").single();
          if (ins.error) return json({ error: "Não foi possível iniciar a licença." }, 500);
          lic = ins.data;
        }
        const cfg = await getConfig(a.db);
        return json({ licenca: view(lic as unknown as Lic), config: { pix: cfg["pix"] || "", whatsapp: cfg["whatsapp"] || "", precos: cfg["precos"] || {}, precosAnuais: cfg["precosAnuais"] || {} }, isDev: a.isDev, termosVersao: TERMOS_VERSAO });
      },
      POST: async ({ request }) => {
        const a = await auth(request);
        if (!a) return json({ error: "Sessão inválida." }, 401);
        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (body?.["acao"] === "aceite") {
          const aceite = { aceito_em: new Date().toISOString(), versao: TERMOS_VERSAO, email: a.email, user_id: a.user.id,
            gestor: String(body["gestor"] || "").slice(0, 120), ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "",
            user_agent: (request.headers.get("user-agent") || "").slice(0, 300) };
          const { error } = await a.db.from("licencas" as never).update({ aceite_termos: aceite } as never).eq("email_dono", a.email);
          return error ? json({ error: "Falha ao registrar o aceite." }, 500) : json({ ok: true, aceite });
        }
        if (!a.isDev) return json({ error: "Acesso restrito ao desenvolvedor." }, 403);
        const p = adminSchema.safeParse(body);
        if (!p.success) return json({ error: "Dados inválidos." }, 400);
        if (p.data.pin !== "1000") return json({ error: "PIN mestre inválido." }, 403);
        const d = p.data;
        const tbl = () => a.db.from("licencas" as never);
        if (d.acao === "listar") {
          const [l, e, f] = await Promise.all([
            tbl().select("*").order("created_at", { ascending: false }),
            a.db.from("empregador").select("email_dono,dados"),
            a.db.from("funcionarios").select("email_dono").not("email_dono", "is", null),
          ]);
          const nomes = new Map((e.data || []).map((x) => [x.email_dono.toLowerCase(), (x.dados as Record<string, string>)?.["razao"] || (x.dados as Record<string, string>)?.["fantasia"] || ""]));
          const qtd = new Map<string, number>();
          (f.data || []).forEach((x) => { const k = String(x.email_dono).toLowerCase(); qtd.set(k, (qtd.get(k) || 0) + 1); });
          const cfg = await getConfig(a.db);
          return json({ config: cfg, contas: ((l.data || []) as Lic[]).map((x) => ({ ...view(x), razao: nomes.get(x.email_dono) || "", colaboradores: qtd.get(x.email_dono) || 0 })) });
        }
        if (d.acao === "config") {
          const { error } = await a.db.from("app_config" as never).upsert({ chave: "cobranca", valor: { pix: d.pix, whatsapp: d.whatsapp, precos: d.precos, precosAnuais: d.precosAnuais } } as never);
          return error ? json({ error: "Falha ao salvar." }, 500) : json({ ok: true });
        }
        const { data: cur } = await tbl().select("*").eq("email_dono", d.email).maybeSingle();
        if (!cur) return json({ error: "Conta não encontrada." }, 404);
        let patch: Record<string, unknown> = {};
        if (d.acao === "renovar") {
          const base = Math.max(Date.now(), new Date((cur as Lic).data_vencimento).getTime());
          patch = { status: "ativo", data_vencimento: new Date(base + d.dias * DAY).toISOString(), tipo_pagamento: d.dias === 365 ? "pix_anual" : "pix" };
        } else if (d.acao === "cortesia") patch = { status: "cortesia", tipo_pagamento: "cortesia" };
        else if (d.acao === "bloquear") patch = { status: "bloqueado" };
        else if (d.acao === "plano") patch = { plano: d.plano };
        const { error } = await tbl().update(patch as never).eq("email_dono", d.email);
        return error ? json({ error: "Falha ao atualizar." }, 500) : json({ ok: true });
      },
    },
  },
});
