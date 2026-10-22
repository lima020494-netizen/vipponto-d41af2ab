import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir senha — Super Admin Ponto Pro Gestão" },
      { name: "description", content: "Defina a senha de acesso à administração do Ponto Pro Gestão." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Definir senha — Ponto Pro Gestão" },
      { property: "og:description", content: "Área restrita de administração." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DefinirSenha,
});

function DefinirSenha() {
  const nav = useNavigate();
  const [senha, setSenha] = useState("");
  const [conf, setConf] = useState("");
  const [msg, setMsg] = useState("");
  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/\d/.test(senha)) return setMsg("Use 8+ caracteres com maiúscula, minúscula e número.");
    if (senha !== conf) return setMsg("As senhas não conferem.");
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) return setMsg("Link expirado ou inválido. Solicite um novo e-mail em /admin.");
    nav({ to: "/admin", replace: true });
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={salvar} className="admin-card w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Definir senha</h1>
        <input className="admin-input" type="password" placeholder="Nova senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <input className="admin-input" type="password" placeholder="Confirmar senha" value={conf} onChange={(e) => setConf(e.target.value)} />
        {msg && <p className="text-sm text-destructive">{msg}</p>}
        <button className="admin-btn w-full">Salvar e entrar</button>
      </form>
    </main>
  );
}
