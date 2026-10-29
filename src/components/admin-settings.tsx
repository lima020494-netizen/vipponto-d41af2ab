import { useState } from "react";
import { Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appSettingsSchema, type AppSettings } from "@/lib/app-settings";

export function AdminSettings({ initial, api, onSave }: { initial: AppSettings; api: (body: Record<string, unknown>) => Promise<unknown>; onSave: (s: AppSettings) => void }) {
  const [s, setS] = useState(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key: keyof AppSettings, value: unknown) => setS(p => ({ ...p, [key]: value }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = appSettingsSchema.safeParse(s);
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? "Confira os campos."); return; }
    setSaving(true); setMessage("");
    try { await api({ acao: "settings", settings: parsed.data }); onSave(parsed.data); setMessage("Configurações globais salvas."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setSaving(false); }
  }
  function logo(file?: File) {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 1000000) { setMessage("Use PNG, JPG ou WebP de até 1 MB."); return; }
    const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === "string") update("logo_url", reader.result); }; reader.readAsDataURL(file);
  }
  const fields = [["nome","Responsável / desenvolvedor"],["empresa","Razão social do fabricante"],["tipoDoc","Tipo de documento"],["doc","CPF/CNPJ"],["email","E-mail de contato"],["telefone","Telefone / WhatsApp"],["cidade","Cidade / UF"],["registroINPI","Registro INPI"]] as const;
  return <form onSubmit={save} className="space-y-8">
    <section className="space-y-4"><h2 className="text-lg font-semibold">Identidade visual</h2>
      <div className="flex flex-wrap items-center gap-4"><img src={s.logo_url || "/vip-logo.png"} alt="Logo do aplicativo" className="h-24 w-24 object-contain" /><label className="admin-btn-ghost flex cursor-pointer items-center gap-2"><Upload size={16} /> Escolher logo<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => logo(e.target.files?.[0])} /></label></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>Nome do aplicativo<input className="admin-input" value={s.app_name} onChange={e => update("app_name", e.target.value)} required /></label>
        <label>Endereço HTTPS da logo<input className="admin-input" type="url" value={s.logo_url.startsWith("https:") ? s.logo_url : ""} onChange={e => update("logo_url",e.target.value)} /></label>
        <label>Versão<input className="admin-input" value={s.version} onChange={e => setS(p => ({...p,version:e.target.value,developer:{...p.developer,versao:e.target.value}}))} required /></label>
        <label className="flex items-center gap-3"><input type="checkbox" checked={s.maintenance} onChange={e => update("maintenance",e.target.checked)} /> Aviso de manutenção</label>
      </div>
    </section>
    <section className="space-y-4 border-t border-border pt-6"><h2 className="text-lg font-semibold">Sobre o Sistema · Desenvolvedor / Fabricante</h2>
      <div className="grid gap-4 md:grid-cols-2">{fields.map(([key,label]) => <label key={key}>{label}<input className="admin-input" value={s.developer[key]} onChange={e => setS(p => ({...p,developer:{...p.developer,[key]:e.target.value}}))} /></label>)}</div>
    </section>
    <div className="flex flex-wrap items-center gap-4"><Button type="submit" disabled={saving}><Save /> {saving ? "Salvando…" : "Salvar configurações"}</Button><p role="status" className="text-sm">{message}</p></div>
  </form>;
}