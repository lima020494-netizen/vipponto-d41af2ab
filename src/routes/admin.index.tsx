import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MASTER_EMAIL } from "@/lib/developer-info";
import { PLANOS_PADRAO, type PlanoCfg } from "@/lib/plans";
import { APP_SETTINGS_DEFAULT, resolveAppSettings, type AppSettings } from "@/lib/app-settings";
import { AdminSettings } from "@/components/admin-settings";
import { MarketingEditor } from "@/components/marketing-editor";
import type { ConhecaContent } from "@/lib/conheca-content";
import { Button } from "@/components/ui/button";
import { Building2, CreditCard, Megaphone, Settings } from "lucide-react";
import { readableTextColor, resolvePlatformLogo } from "@/lib/platform-identity";

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
type Conheca = ConhecaContent;
type Lista = { settings: AppSettings; contas: Conta[]; config: { pix?: string; whatsapp?: string; precos?: Record<string, number | null>; precosAnuais?: Record<string, number | null> }; planos: Record<string, PlanoCfg>; conheca: Conheca };

const limiteDe = (planos: Record<string, PlanoCfg>, p: number) => planos[p]?.colaboradores ?? PLANOS_PADRAO[p]?.colaboradores ?? 10;
const ROT: Record<string, string> = { trial: "Teste", ativo: "Ativo", tolerancia: "Tolerância", bloqueado: "Bloqueado", cortesia: "Cortesia" };

function AdminPage() {
  const [identity,setIdentity] = useState(APP_SETTINGS_DEFAULT);
  useEffect(()=>{supabase.from("app_settings").select("settings").eq("id","global").maybeSingle().then(({data})=>setIdentity(resolveAppSettings(data?.settings)));},[]);
  useEffect(()=>{const shell=document.querySelector<HTMLElement>(".admin-shell");if(shell){shell.style.setProperty("--adm-bg",identity.primary_color);shell.style.setProperty("--adm-gold",identity.accent_color);shell.style.setProperty("--adm-text",readableTextColor(identity.text_color,identity.primary_color));}},[identity]);
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email?.toLowerCase() ?? null));
    const { data } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT" || ev === "USER_UPDATED") setEmail(s?.user?.email?.toLowerCase() ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (email === undefined) return <p className="p-8 text-center">Carregando…</p>;
  if (email !== MASTER_EMAIL) return <Login outraConta={email} identity={identity} />;
  return <Painel />;
}

function Login({ outraConta, identity }: { outraConta: string | null; identity: AppSettings }) {
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
        <img src={resolvePlatformLogo(identity.logo_url)} alt="Logo do aplicativo" className="h-16 w-16 object-contain" /><h1 className="text-xl font-semibold">Super Admin</h1>
        <p className="text-sm opacity-80">{MASTER_EMAIL}</p>
        <input className="admin-input" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <Button className="admin-btn w-full">Entrar</Button>
        <Button type="button" className="admin-btn-ghost w-full" onClick={primeiroAcesso}>Primeiro acesso / esqueci a senha</Button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </main>
  );
}

function Painel() {
  const [tab, setTab] = useState("empresas");
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
      window.location.href = "/gestor?suporte=1";
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
          <Button className="admin-btn w-full">Abrir painel</Button>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button type="button" className="admin-btn-ghost w-full" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </form>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3"><img src={resolvePlatformLogo(dados.settings?.logo_url || "")} alt="Logo do app" className="h-12 w-12 object-contain" /><div><p className="text-xs text-muted-foreground">SUPER ADMIN</p><h1 className="text-xl font-semibold">{dados.settings?.app_name || "Ponto Pro Gestão"}</h1></div></div>
        <Button className="admin-btn-ghost" onClick={() => supabase.auth.signOut()}>Sair</Button>
      </header>
      <nav className="admin-tabs" aria-label="Seções do Super Admin">{[["empresas","Empresas e Suporte",Building2],["planos","Planos e Preços",CreditCard],["marketing","Marketing",Megaphone],["settings","Configurações Globais / Sobre",Settings]].map(([id,label,Icon]) => { const I = Icon as typeof Building2; return <Button key={String(id)} variant={tab===id?"default":"ghost"} aria-current={tab===id?"page":undefined} onClick={()=>setTab(String(id))}><I />{String(label)}</Button>; })}</nav>
      {tab === "planos" && <><Cobranca dados={dados} api={api} /><PlanosEditor inicial={dados.planos} api={api} /></>}
      {tab === "marketing" && <MarketingEditor inicial={dados.conheca} api={api} planos={dados.planos} />}
      {tab === "settings" && <AdminSettings initial={dados.settings || APP_SETTINGS_DEFAULT} api={api} onSave={settings => {setDados(p=>p?{...p,settings}:p);const shell=document.querySelector<HTMLElement>(".admin-shell");shell?.style.setProperty("--adm-bg",settings.primary_color);shell?.style.setProperty("--adm-gold",settings.accent_color);shell?.style.setProperty("--adm-text",readableTextColor(settings.text_color,settings.primary_color));}} />}
      {tab === "empresas" && <section className="admin-card">
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
                    {[1, 2, 3].map((p) => <option key={p} value={p}>{dados.planos[p]?.nome || `Plano ${p}`} · {limiteDe(dados.planos, p)} colab.</option>)}</select></td>
                  <td>{c.colaboradores}/{limiteDe(dados.planos, c.plano)}</td>
                  <td>{c.estado === "cortesia" ? "—" : new Date(c.data_vencimento).toLocaleDateString("pt-BR")}</td>
                  <td>{ROT[c.estado] ?? c.estado}</td>
                  <td className="flex flex-wrap gap-1">
                    <Button className="admin-btn" onClick={() => suporte(c)}>Acessar como esta empresa</Button>
                    <Button className="admin-btn" onClick={() => acao("renovar", c.email_dono, { dias: 30 })}>+30 dias</Button>
                    <Button className="admin-btn" onClick={() => acao("renovar", c.email_dono, { dias: 365 })}>+1 ano</Button>
                    <Button className="admin-btn-ghost" onClick={() => acao("cortesia", c.email_dono)}>Cortesia</Button>
                    <Button className="admin-btn-ghost" onClick={() => acao("bloquear", c.email_dono)}>Bloquear</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}
    </main>
  );
}

type Api = (b: Record<string, unknown>) => Promise<unknown>;

function Cobranca({ dados, api }: { dados: Lista; api: Api }) {
  const c = dados.config;
  const [pix, setPix] = useState(c.pix ?? "");
  const [wa, setWa] = useState(c.whatsapp ?? "");
  async function salvar() {
    try { await api({ acao: "config", pix: pix.trim(), whatsapp: wa.trim() }); alert("Cobrança salva."); } catch (e) { alert((e as Error).message); }
  }
  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold">Cobrança</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label>Chave PIX<input className="admin-input" value={pix} onChange={(e) => setPix(e.target.value)} /></label>
        <label>WhatsApp de suporte<input className="admin-input" value={wa} onChange={(e) => setWa(e.target.value)} /></label>
      </div>
      <p className="text-sm opacity-70">Os preços agora são definidos por plano na seção "Planos e Limites" abaixo.</p>
      <Button className="admin-btn" onClick={salvar}>Salvar cobrança</Button>
    </section>
  );
}

function PlanosEditor({ inicial, api }: { inicial: Record<string, PlanoCfg>; api: Api }) {
  const [planos, setPlanos] = useState<Record<string, PlanoCfg>>(inicial);
  const setP = (id: string, patch: Partial<PlanoCfg>) => setPlanos((prev) => {
    const cur = prev[id];
    return cur ? { ...prev, [id]: { ...cur, ...patch } } : prev;
  });
  const num = (v: string) => (v === "" ? null : Number(v));
  async function salvar() {
    try { await api({ acao: "planos", planos }); alert("Planos salvos. O app dos clientes já lê estes limites e preços."); } catch (e) { alert((e as Error).message); }
  }
  return (
    <section className="admin-card space-y-3">
      <h2 className="text-lg font-semibold">Planos e Limites</h2>
      <p className="text-sm opacity-70">Nome, preços, limites e status lidos dinamicamente pelo app do cliente. Planos inativos deixam de ser oferecidos.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.keys(planos).sort().map((id) => {
          const p = planos[id];
          if (!p) return null;
          return (
            <div key={id} className="space-y-1">
              <label className="flex items-center gap-2"><input type="checkbox" checked={p.ativo} onChange={(e) => setP(id, { ativo: e.target.checked })} /> Plano {id} ativo</label>
              <label>Nome<input className="admin-input" value={p.nome} onChange={(e) => setP(id, { nome: e.target.value })} /></label>
              <label>Empresas no aparelho<input className="admin-input" type="number" min={1} value={p.empresas} onChange={(e) => setP(id, { empresas: Math.max(1, +e.target.value || 1) })} /></label>
              <label>Limite de colaboradores<input className="admin-input" type="number" min={1} value={p.colaboradores} onChange={(e) => setP(id, { colaboradores: Math.max(1, +e.target.value || 1) })} /></label>
              <label>Limite de gerenciadores<input className="admin-input" type="number" min={1} max={100} value={p.gerenciadores} onChange={(e) => setP(id, { gerenciadores: Math.min(100, Math.max(1, +e.target.value || 1)) })} /></label>
              <label>Mensal (R$, vazio = sob consulta)<input className="admin-input" type="number" value={p.mensal ?? ""} onChange={(e) => setP(id, { mensal: num(e.target.value) })} /></label>
              <label>Anual (R$, vazio = sob consulta)<input className="admin-input" type="number" value={p.anual ?? ""} onChange={(e) => setP(id, { anual: num(e.target.value) })} /></label>
              <label>Recursos (um por linha)<textarea rows={4} className="admin-input" value={p.recursos.join("\n")} onChange={(e) => setP(id, { recursos: e.target.value.split("\n").filter(Boolean).slice(0, 8) })} /></label>
            </div>
          );
        })}
      </div>
      <Button className="admin-btn" onClick={salvar}>Salvar planos</Button>
    </section>
  );
}
