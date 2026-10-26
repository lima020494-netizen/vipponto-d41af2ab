import { useState } from "react";
import { Upload, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_DEFAULT, type ConhecaContent, type HeroModule } from "@/lib/conheca-content";
import type { PlanoCfg } from "@/lib/plans";

type Api = (b: Record<string, unknown>) => Promise<unknown>;

/** Reduz a foto no navegador para caber na configuração (máx. 1600px, JPEG). */
function reduzirImagem(file: File): Promise<string> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => {
      const esc = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * esc); c.height = Math.round(img.height * esc);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      let q = 0.82, out = c.toDataURL("image/jpeg", q);
      while (out.length > 880_000 && q > 0.4) { q -= 0.1; out = c.toDataURL("image/jpeg", q); }
      out.length > 880_000 ? fail(new Error("Imagem muito grande; use outra foto.")) : ok(out);
    };
    img.onerror = () => fail(new Error("Arquivo de imagem inválido."));
    img.src = URL.createObjectURL(file);
  });
}

/** Módulo editável: Topo e chamada principal. Novos módulos entram na lista MODULOS. */
function HeroModuleEditor({ k, setK }: { k: ConhecaContent; setK: (c: ConhecaContent) => void }) {
  const h = k.hero ?? HERO_DEFAULT;
  const setH = (patch: Partial<HeroModule>) => setK({ ...k, hero: { ...h, ...patch } });
  async function escolher(file?: File) {
    if (!file) return;
    try { setH({ image_url: await reduzirImagem(file) }); } catch (e) { alert((e as Error).message); }
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label>Frase de destaque<input className="admin-input" maxLength={120} value={k.tagline} onChange={(e) => setK({ ...k, tagline: e.target.value })} /></label>
        <label>WhatsApp comercial<input className="admin-input" value={k.whatsapp} onChange={(e) => setK({ ...k, whatsapp: e.target.value })} /></label>
      </div>
      <label>Título principal<input className="admin-input" maxLength={200} value={k.headline} onChange={(e) => setK({ ...k, headline: e.target.value })} /></label>
      <label>Subtítulo<textarea className="admin-input" maxLength={300} value={k.subtitle} onChange={(e) => setK({ ...k, subtitle: e.target.value })} /></label>
      <div className="grid gap-3 md:grid-cols-2">
        <label>Botão principal<input className="admin-input" maxLength={40} value={h.cta_primary} onChange={(e) => setH({ cta_primary: e.target.value })} /></label>
        <label>Botão do WhatsApp<input className="admin-input" maxLength={40} value={h.cta_secondary} onChange={(e) => setH({ cta_secondary: e.target.value })} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => <label key={i}>Selo {i + 1}<input className="admin-input" maxLength={60} value={h.highlights[i] ?? ""} onChange={(e) => { const n = [...h.highlights]; n[i] = e.target.value; setH({ highlights: n.slice(0, 3) }); }} /></label>)}
      </div>
      <fieldset className="space-y-3 border-t border-border pt-3">
        <legend className="font-semibold">Imagem de fundo</legend>
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-24 w-40 overflow-hidden rounded border border-border bg-muted">{h.image_url ? <img src={h.image_url} alt={h.image_alt} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Imagem padrão</span>}</div>
          <label className="admin-btn-ghost flex cursor-pointer items-center gap-2"><Upload size={16} /> Escolher foto<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => escolher(e.target.files?.[0])} /></label>
          {h.image_url && <Button variant="ghost" onClick={() => setH({ image_url: "" })}>Usar imagem padrão</Button>}
        </div>
        <label>Endereço HTTPS da imagem<input className="admin-input" type="url" value={h.image_url.startsWith("data:") ? "" : h.image_url} onChange={(e) => setH({ image_url: e.target.value })} /></label>
        <label>Descrição da imagem (acessibilidade)<input className="admin-input" maxLength={160} value={h.image_alt} onChange={(e) => setH({ image_alt: e.target.value })} /></label>
      </fieldset>
    </div>
  );
}

const MODULOS = [{ id: "hero", titulo: "Topo e chamada principal", Editor: HeroModuleEditor }] as const;

export function MarketingEditor({ inicial, api, planos }: { inicial: ConhecaContent; api: Api; planos: Record<string, PlanoCfg> }) {
  const [k, setK] = useState<ConhecaContent>({ ...inicial, hero: inicial.hero ?? HERO_DEFAULT });
  const [ativo, setAtivo] = useState<string>(MODULOS[0].id);
  const [salvando, setSalvando] = useState(false);
  async function salvar() {
    setSalvando(true);
    try {
      await api({ acao: "conheca", conteudo: { ...k, whatsapp: k.whatsapp.replace(/\D/g, ""), hero: { ...k.hero, highlights: k.hero.highlights.map((s) => s.trim()).filter(Boolean) }, plans: k.plans.map((p) => ({ ...p, price: p.price || null, benefits: p.benefits.filter(Boolean).slice(0, 8) })) } });
      alert("Página comercial salva.");
    } catch (e) { alert((e as Error).message); } finally { setSalvando(false); }
  }
  const Mod = MODULOS.find((m) => m.id === ativo) ?? MODULOS[0];
  return (
    <section className="admin-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Editor da página Conheça</h2>
        <a className="text-sm underline" href="/conheca" target="_blank" rel="noopener noreferrer">Abrir página</a>
      </div>
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Módulos da página" className="flex flex-col gap-2">
          {MODULOS.map((m) => <Button key={m.id} variant={ativo === m.id ? "default" : "ghost"} className="justify-start" aria-current={ativo === m.id ? "true" : undefined} onClick={() => setAtivo(m.id)}><LayoutTemplate />{m.titulo}</Button>)}
        </nav>
        <div><h3 className="mb-3 font-semibold">{Mod.titulo}</h3><Mod.Editor k={k} setK={setK} /></div>
      </div>
      <p className="text-sm text-muted-foreground">Os planos exibidos vêm da aba Planos e Preços ({Object.values(planos).filter((p) => p.ativo).length} ativos).</p>
      <Button className="admin-btn" disabled={salvando} onClick={salvar}>{salvando ? "Salvando..." : "Salvar página comercial"}</Button>
    </section>
  );
}
