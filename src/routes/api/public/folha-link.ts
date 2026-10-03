import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const createLinkSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
});
const tokenSchema = z.string().min(32).max(256).regex(/^[A-Za-z0-9_-]+$/);

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store, private" } });
}

function base64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function monthBounds(competencia: string) {
  const [year, month] = competencia.split("-").map(Number);
  const endDate = new Date(Date.UTC(year, month, 0));
  return {
    start: `${competencia}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-${String(endDate.getUTCDate()).padStart(2, "0")}`,
  };
}

export const Route = createFileRoute("/api/public/folha-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
        if (!bearer) return json({ error: "Sessão necessária." }, 401);
        const parsed = createLinkSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Funcionário ou competência inválidos." }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(bearer);
        const email = userData.user?.email?.toLowerCase();
        if (userError || !userData.user || !email) return json({ error: "Sessão inválida." }, 401);
        const { data: employee, error: employeeError } = await supabaseAdmin
          .from("funcionarios").select("nome,email_dono").eq("email_dono", email).eq("pin", parsed.data.pin).maybeSingle();
        if (employeeError || !employee) return json({ error: "Funcionário não encontrado." }, 404);

        const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
        const { error: insertError } = await supabaseAdmin.from("folha_access_tokens").insert({
          token_hash: await hashToken(token), user_id: userData.user.id, email_dono: email,
          funcionario_pin: parsed.data.pin, competencia: `${parsed.data.competencia}-01`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (insertError) return json({ error: "Não foi possível criar o link." }, 500);
        const url = new URL("/vip-ponto.html", request.url);
        url.searchParams.set("folha_token", token);
        return json({ url: url.toString(), employeeName: employee.nome });
      },
      GET: async ({ request }) => {
        const parsedToken = tokenSchema.safeParse(new URL(request.url).searchParams.get("token"));
        if (!parsedToken.success) return json({ error: "Link inválido." }, 400);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: grant, error: grantError } = await supabaseAdmin.from("folha_access_tokens")
          .select("id,email_dono,funcionario_pin,competencia,expires_at,revoked_at")
          .eq("token_hash", await hashToken(parsedToken.data)).maybeSingle();
        if (grantError || !grant || grant.revoked_at || new Date(grant.expires_at).getTime() <= Date.now()) {
          return json({ error: "Este link é inválido ou expirou." }, 410);
        }
        const { start, end } = monthBounds(String(grant.competencia).slice(0, 7));
        const [employeeResult, pointsResult, employerResult, schedulesResult, holidaysResult, dataResult] = await Promise.all([
          supabaseAdmin.from("funcionarios").select("dados").eq("email_dono", grant.email_dono).eq("pin", grant.funcionario_pin).maybeSingle(),
          supabaseAdmin.from("pontos").select("dados").eq("email_dono", grant.email_dono).eq("pin", grant.funcionario_pin).gte("data", start).lte("data", end).order("data").order("hora"),
          supabaseAdmin.from("empregador").select("dados").eq("email_dono", grant.email_dono).maybeSingle(),
          supabaseAdmin.from("escala").select("semana,dados").eq("email_dono", grant.email_dono),
          supabaseAdmin.from("feriados").select("data,nome,tipo,dados").eq("conta", grant.email_dono).gte("data", start).lte("data", end),
          supabaseAdmin.from("dados").select("chave,valor").eq("conta", grant.email_dono).in("chave", ["ocorrencias", "config"]),
        ]);
        const failure = [employeeResult, pointsResult, employerResult, schedulesResult, holidaysResult, dataResult].find((result) => result.error);
        if (failure?.error || !employeeResult.data?.dados) return json({ error: "Folha indisponível." }, 404);
        const employee = { ...(employeeResult.data.dados as Record<string, unknown>), pin: "self" };
        const points = (pointsResult.data ?? []).flatMap((row) => row.dados ? [{ ...(row.dados as Record<string, unknown>), pin: "self" }] : []);
        const schedules = Object.fromEntries((schedulesResult.data ?? []).flatMap((row) => {
          if (!row.semana || !row.dados) return [];
          const schedule = { ...(row.dados as Record<string, unknown>) };
          const entries = Array.isArray(schedule.folgas) ? schedule.folgas : [];
          schedule.folgas = entries.filter((entry) => entry && typeof entry === "object" && (entry as { pin?: string }).pin === grant.funcionario_pin)
            .map((entry) => ({ ...(entry as Record<string, unknown>), pin: "self" }));
          return [[row.semana, schedule]];
        }));
        const misc = Object.fromEntries((dataResult.data ?? []).map((row) => {
          if (row.chave !== "ocorrencias" || !Array.isArray(row.valor)) return [row.chave, row.valor];
          return [row.chave, row.valor.filter((entry) => entry && typeof entry === "object" && (entry as { pin?: string }).pin === grant.funcionario_pin)
            .map((entry) => ({ ...(entry as Record<string, unknown>), pin: "self" }))];
        }));
        await supabaseAdmin.from("folha_access_tokens").update({ last_accessed_at: new Date().toISOString() }).eq("id", grant.id);
        return json({ start, end, employee, points, employer: employerResult.data?.dados ?? {}, schedules,
          holidays: (holidaysResult.data ?? []).map((row) => row.dados ?? { data: row.data, nome: row.nome, tipo: row.tipo }), misc });
      },
    },
  },
});