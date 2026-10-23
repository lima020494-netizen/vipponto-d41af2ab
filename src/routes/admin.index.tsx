import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MASTER_EMAIL } from "@/lib/developer-info";

const SUPA_REF = new URL(import.meta.env["VITE_SUPABASE_URL"] ?? "https://kvbidsfnisegtqjagsld.supabase.co").hostname.split(".")[0];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Super Admin — Ponto Pro Gestão" },
      { name: "description", content: "Administração de clientes, planos e cobrança do Ponto Pro Gestão." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Super Admin — Ponto Pro Gestão" },
      { property: "og:description", content: "Área restrita de administração." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Conta = { email_dono: string; razao: string; cnpj: string; created_at?: string; plano: number; colaboradores: number; data_vencimento: string; estado: string };
type Plano = { name: string; price: string | null; caption: string; benefits: string[] };
type Conheca = { whatsapp: string; tagline: string; headline: string; subtitle: string; plans: Plano[] };
type Lista = { contas: Conta[]; config: { pix?: string; whatsapp?: string; precos?: Record<string, number | null>; precosAnuais?: Record<string, number | null> }; conheca: Conheca };

const LIMITE: Record<number, number> = { 1: 10, 2: 25, 3: 50 };
const ROT: Record<string, string> = { trial: "Teste", ativo: "Ativo", tolerancia: "Tolerância", bloqueado: "Bloqueado", cortesia: "Cortesia" };

function AdminPage() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email?.toLowerCase() ?? null));
    const { data } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT" || ev === "USER_UPDATED") setEmail(s?.user?.email?.toLowerCase() ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (email === undefined) return <p className="p-8 text-center">Carregando…</p>;
  if (email !== MASTER_EMAIL) return <Login outraConta={email} />;
  return <Painel />;
}

function Login({ outraConta }: { outraConta: string | null }) {
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState(outraConta ? "Esta conta não tem acesso à administração." : "");
  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (outraConta) await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({ email: MASTER_EMAIL, password: senha });
    if (error) setMsg("Senha inválida ou primeiro acesso ainda não concluído.");
  }
  async function primeiroAcesso() {
    setMsg("Enviando…");
    const r = await fetch("/api/public/admin-acesso", { method: "POST" });
    setMsg(r.ok ? `Enviamos um link para ${MASTER_EMAIL} para definir a senha.` : "Não foi possível enviar o e-mail agora.");
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={entrar} className="admin-card w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Super Admin</h1>
        <p className="text-sm opacity-80">{MASTER_EMAIL}</p>
        <input className="admin-input" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button className="admin-btn w-full">Entrar</button>
        <button type="button" className="admin-btn-ghost w-full" onClick={primeiroAcesso}>Primeiro acesso / esqueci a senha</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </main>
  );
}

function Painel() {
  const [pin, setPin] = useState("");
  const [dados, setDados] = useState<Lista | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const api = useCallback(async (body: Record<string, unknown>) => {
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/public/licenca", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ pin, ...body }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Falha na operação.");
    return j;
  }, [pin]);
  const carregar = useCallback(async () => {
    setErro("");
    try { setDados(await api({ acao: "listar" })); } catch (e) { setErro((e as Error).message); }
  }, [api]);
  const acao = async (acao: string, email: string, extra: Record<string, unknown> = {}) => {
    if (acao === "bloquear" && !confirm(`Bloquear ${email}? Os dados não serão apagados.`)) return;
    try { await api({ acao, email, ...extra }); carregar(); } catch (e) { alert((e as Error).message); }
  };

  async function suporte(c: Conta) {
    const motivo = prompt(`Motivo do acesso de suporte a ${c.razao || c.email_dono}:`)?.trim();
    if (!motivo || motivo.length < 3) return;
    try {
      await api({ acao: "suporte_iniciar", email: c.email_dono, motivo });
      // Compartilha a sessão do admin com o app do cliente (mesma origem, chave padrão do Supabase).
      const { data } = await supabase.auth.getSession();
      if (data.session) localStorage.setItem(`sb-${SUPA_REF}-auth-token`, JSON.stringify(data.session));
      window.location.href = `/vip-ponto.html?suporte=1&v=${Date.now()}`;
    } catch (e) { alert((e as Error).message); }
  }
  const q = busca.trim().toLowerCase(), qd = q.replace(/\D/g, "");
  const contas = (dados?.contas ?? []).filter((c) => !q || c.razao.toLowerCase().includes(q) || c.email_dono.includes(q) || (qd && (c.cnpj || "").replace(/\D/g, "").includes(qd)));

  if (!dados)
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <form className="admin-card w-full max-w-sm space-y-3" onSubmit={(e) => { e.preventDefault(); carregar(); }}>
          <h1 className="text-xl font-semibold">Confirmação de segurança</h1>
          <input className="admin-input" inputMode="numeric" type="password" placeholder="PIN mestre" value={pin} onChange={(e) => setPin(e.target.value)} />
          <button className="admin-btn w-full">Abrir painel</button>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <button type="button" className="admin-btn-ghost w-full" onClick={() => supabase.auth.signOut()}>Sair</button>
        </form>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Super Admin · Ponto Pro Gestão</h1>
        <button className="admin-btn-ghost" onClick={() => supabase.auth.signOut()}>Sair</button>
      </header>
      <Cobranca dados={dados} api={api} />
      <ConhecaEditor inicial={dados.conheca} api={api} />
      <section className="admin-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Empresas ({contas.length}/{dados.contas.length})</h2>
          <input className="admin-input max-w-xs" placeholder="Buscar por nome ou CNPJ" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>Empresa</th><th>CNPJ</th><th>Criada em</th><th>Plano</th><th>Colab.</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {contas.map((c) => (
                <tr key={c.email_dono} className="border-t border-white/10 align-top">
                  <td className="py-2"><b>{c.razao || "—"}</b><div className="opacity-70">{c.email_dono}</div></td>
                  <td>{c.cnpj || "—"}</td>
                  <td>{c.created_at ? new Date(c.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                  <td><select className="admin-input" value={c.plano} onChange={(e) => acao("plano", c.email_dono, { plano: +e.target.value })}>
                    {[1, 2, 3].map((p) => <option key={p} value={p}>Plano {p} · {LIMITE[p]} colab.</option>)}</select></td>
                  <td>{c.colaboradores}/{LIMITE[c.plano]}</td>
                  <td>{c.estado === "cortesia" ? "—" : new Date(c.data_vencimento).toLocaleDateString("pt-BR")}</td>
                  <td>{ROT[c.estado] ?? c.estado}</td>
                  <td className="flex flex-wrap gap-1">
                    <button className="admin-btn" onClick={() => suporte(c)}>Acessar como esta empresa</button>
                    <button className="admin-btn" onClick={() => acao("renovar", c.email_dono, { dias: 30 })}>+30 dias</button>
                    <button className="admin-btn" onClick={() => acao("renovar", c.email_dono, { dias: 365 })}>+1 ano</button>
                    <button className="admin-btn-ghost" onClick={() => acao("cortesia", c.email_dono)}>Cortesia</button>
                    <button className="admin-btn-ghost" onClick={() => acao("bloquear", c.email_dono)}>Bloquear</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

type Api = (b: Record<string, unknown>) => Promise<unknown>;

function Cobranca({ dados, api }: { dados: Lista; api: Api }) {
  const c = dados.config;
  const [pix, setPix] = useState(c.pix ?? "");
  const [wa, setWa] = useState(c.whatsapp ?? "");
  const [pm, setPm] = useState<Record<string, string>>(Object.fromEntries([1, 2, 3].map((p) => [p, String(c.precos?.[p] ?? "")])));
  const [pa, setPa] = useState<Record<string, string>>(Object.fromEntries([1, 2, 3].map((p) => [p, String(c.precosAnuais?.[p] ?? "")])));
  const num = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === "" ? null : Number(v)]));
  async function salvar() {
    try { await api({ acao: "config", pix: pix.trim(), whatsapp: wa.trim(), precos: num(pm), precosAnuais: num(pa) }); alert("Cobrança salva."); } catch (e) { alert((e as Error).message); }
  }
  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold">Cobrança</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label>Chave PIX<input className="admin-input" value={pix} onChange={(e) => setPix(e.target.value)} /></label>
        <label>WhatsApp de suporte<input className="admin-input" value={wa} onChange={(e) => setWa(e.target.value)} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((p) => (
          <div key={p}>
            <label>Plano {p} mensal (R$)<input className="admin-input" type="number" value={pm[p]} onChange={(e) => setPm({ ...pm, [p]: e.target.value })} /></label>
            <label>Plano {p} anual (R$)<input className="admin-input" type="number" value={pa[p]} onChange={(e) => setPa({ ...pa, [p]: e.target.value })} /></label>
          </div>
        ))}
      </div>
      <button className="admin-btn" onClick={salvar}>Salvar cobrança</button>
    </section>
  );
}

function ConhecaEditor({ inicial, api }: { inicial: Conheca; api: Api }) {
  const [k, setK] = useState<Conheca>(inicial);
  const setPlano = (i: number, p: Partial<Plano>) => setK({ ...k, plans: k.plans.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  async function salvar() {
    try {
      await api({ acao: "conheca", conteudo: { ...k, whatsapp: k.whatsapp.replace(/\D/g, ""), plans: k.plans.map((p) => ({ ...p, price: p.price || null, benefits: p.benefits.filter(Boolean).slice(0, 8) })) } });
      alert("Página comercial salva.");
    } catch (e) { alert((e as Error).message); }
  }
  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold">Página comercial (/conheca)</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label>WhatsApp comercial<input className="admin-input" value={k.whatsapp} onChange={(e) => setK({ ...k, whatsapp: e.target.value })} /></label>
        <label>Frase de destaque<input className="admin-input" value={k.tagline} onChange={(e) => setK({ ...k, tagline: e.target.value })} /></label>
      </div>
      <label>Título<input className="admin-input" value={k.headline} onChange={(e) => setK({ ...k, headline: e.target.value })} /></label>
      <label>Subtítulo<textarea className="admin-input" value={k.subtitle} onChange={(e) => setK({ ...k, subtitle: e.target.value })} /></label>
      <div className="grid gap-3 md:grid-cols-3">
        {k.plans.map((p, i) => (
          <div key={i} className="space-y-1">
            <label>Nome<input className="admin-input" value={p.name} onChange={(e) => setPlano(i, { name: e.target.value })} /></label>
            <label>Preço (vazio = sob consulta)<input className="admin-input" value={p.price ?? ""} onChange={(e) => setPlano(i, { price: e.target.value })} /></label>
            <label>Descrição<input className="admin-input" value={p.caption} onChange={(e) => setPlano(i, { caption: e.target.value })} /></label>
            <label>Benefícios (um por linha)<textarea rows={5} className="admin-input" value={p.benefits.join("\n")} onChange={(e) => setPlano(i, { benefits: e.target.value.split("\n") })} /></label>
          </div>
        ))}
      </div>
      <button className="admin-btn" onClick={salvar}>Salvar página comercial</button>
    </section>
  );
}
