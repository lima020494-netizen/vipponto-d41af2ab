import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ShieldCheck, WifiOff, Printer, Smartphone, Clock3, Headphones, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import kioskImage from "@/assets/conheca-kiosk.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONHECA_DEFAULT, resolveConheca } from "@/lib/conheca-content";

const logo = "/__l5e/assets-v1/798df0df-fee7-4f44-b98f-df1e096c0ace/ponto-pro-gestao-logo.jpg";

export const Route = createFileRoute("/conheca")({
  head: () => ({
    meta: [
      { title: "Conheça Ponto Pro Gestão — Ponto eletrônico para Kiosk, Sunmi e PWA" },
      { name: "description", content: "Conheça o Ponto Pro Gestão: registro de ponto offline, comprovantes e relatórios para sua empresa. Planos Básico a R$ 49/mês e Pro a R$ 89/mês. Teste por 7 dias." },
      { property: "og:title", content: "Ponto Pro Gestão — Ponto eletrônico seguro para sua empresa" },
      { property: "og:description", content: "Kiosk, Sunmi e PWA com funcionamento offline, comprovantes e relatórios. Conheça os planos e teste por 7 dias." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vippontopro.app/conheca" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://vippontopro.app/conheca" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: ConhecaPage,
});

const resources = [
  { icon: WifiOff, title: "Sua jornada continua offline", copy: "Marcações guardadas no aparelho e sincronizadas quando a conexão retorna." },
  { icon: Printer, title: "Comprovante na hora", copy: "Impressão térmica 58 mm com data, hora, NSR e hash de autenticidade." },
  { icon: Smartphone, title: "Kiosk, Sunmi e PWA", copy: "Registro por PIN no quiosque e acesso às folhas pelo celular." },
];

function ConhecaPage() {
  const [k, setK] = useState(CONHECA_DEFAULT);
  useEffect(() => {
    supabase.from("app_config").select("valor").eq("chave", "conheca").maybeSingle()
      .then(({ data }) => { if (data?.valor) setK(resolveConheca(data.valor)); }, () => {});
  }, []);
  const whatsapp = `https://wa.me/${k.whatsapp}`;
  const plans = k.plans.map((p, i) => ({ ...p, featured: i === 1 }));
  return <div className="commercial min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link to="/conheca" aria-label="Ponto Pro Gestão — Conheça" className="flex items-center gap-3">
          <img src={logo} alt="Logo Ponto Pro Gestão" width={76} height={52} className="h-13 w-19 object-contain" />
          <span className="text-lg font-extrabold">Ponto Pro <span className="text-primary">Gestão</span></span>
        </Link>
        <nav aria-label="Navegação comercial" className="order-3 flex w-full justify-center gap-7 text-sm font-semibold text-muted-foreground md:order-none md:w-auto">
          <a href="#recursos" className="hover:text-primary">Recursos</a><a href="#planos" className="hover:text-primary">Planos</a><a href="#contato" className="hover:text-primary">Contato</a>
        </nav>
        <Button asChild variant="outline" className="text-xs"><Link to="/">ACESSAR SISTEMA <ArrowUpRight /></Link></Button>
      </div>
    </header>
    <main>
      <section className="commercial-hero relative isolate overflow-hidden">
        <img src={kioskImage} alt="Registro de ponto em um quiosque com impressora térmica em um lounge" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="commercial-enter relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-22">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase text-primary"><ShieldCheck size={18} /> {k.tagline}</div>
          <div className="mb-5 text-lg font-bold">Ponto Pro Gestão</div>
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">{k.headline}</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">{k.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-xs font-extrabold"><Link to="/">TESTAR 7 DIAS GRÁTIS <ArrowUpRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-xs"><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle /> FALAR NO WHATSAPP</a></Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Check className="commercial-check" size={15} /> 7 dias de teste</span><span className="flex items-center gap-2"><Check className="commercial-check" size={15} /> Dados isolados por conta</span></div>
        </div>
      </section>
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-7 md:flex-row md:px-10">
          <div><p className="text-xs uppercase text-muted-foreground">Presente na rotina de quem recebe bem</p><p className="mt-2 text-sm">Usado por <strong className="font-extrabold">ATALAIA VIP LOUNGE</strong></p></div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-semibold">{[[ShieldCheck,"Kiosk Ilimitado"],[Clock3,"Relatórios em Tempo Real"],[Headphones,"Suporte"]].map(([Icon,label])=>{const BadgeIcon=Icon as typeof ShieldCheck;return <span key={String(label)} className="flex items-center gap-2"><BadgeIcon size={17} className="text-primary" />{String(label)}</span>;})}</div>
        </div>
      </section>
      <section id="recursos" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 md:px-10">
        <p className="text-xs font-bold uppercase text-primary">Do registro ao fechamento</p><h2 className="mt-3 text-2xl font-semibold md:text-3xl">Tudo no ritmo da sua empresa.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">{resources.map(({icon:Icon,title,copy})=><div key={title} className="border-t border-border pt-6"><Icon size={28} className="mb-5 text-primary"/><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p></div>)}</div>
      </section>
      <section id="planos" className="scroll-mt-8 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
          <div className="mb-10 text-center"><p className="text-xs font-bold uppercase text-primary">Planos</p><h2 className="mt-3 text-2xl font-semibold md:text-3xl">O próximo passo da sua gestão.</h2><p className="mt-4 text-sm text-muted-foreground">Comece com 7 dias grátis. Escolha o plano para a sua rotina.</p></div>
          <div className="grid items-stretch gap-5 md:grid-cols-3">{plans.map(plan=><article key={plan.name} className={`relative flex flex-col rounded-lg border bg-card p-7 ${plan.featured?"border-primary":"border-border"}`}>
            {plan.featured&&<span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">MAIS COMPLETO</span>}
            <h3 className="text-xl font-semibold">{plan.name}</h3><p className="mt-2 text-sm text-muted-foreground">{plan.caption}</p>
            <div className="mt-7 flex min-h-14 items-baseline gap-2">{plan.price?<><span className="text-sm text-muted-foreground">R$</span><strong className="text-5xl font-semibold">{plan.price}</strong><span className="text-sm text-muted-foreground">/mês</span></>:<strong className="text-3xl font-semibold">Sob Consulta</strong>}</div>
            <ul className="my-7 space-y-4 border-t border-border pt-6">{plan.benefits.map(b=><li key={b} className="flex gap-3 text-sm"><Check size={17} className="commercial-check shrink-0"/>{b}</li>)}</ul>
            <Button asChild size="lg" variant={plan.featured?"default":"outline"} className="mt-auto w-full">{plan.price?<Link to="/">Testar grátis <ChevronRight /></Link>:<a href={whatsapp} target="_blank" rel="noopener noreferrer">Falar com a equipe <ArrowUpRight /></a>}</Button>
          </article>)}</div>
        </div>
      </section>
      <section id="contato" className="mx-auto flex max-w-7xl scroll-mt-8 flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center md:px-10"><div><p className="text-xs font-bold uppercase text-primary">Vamos conversar</p><h2 className="mt-3 text-2xl font-semibold">Sua empresa merece uma gestão tranquila.</h2><p className="mt-3 text-sm text-muted-foreground">Tire suas dúvidas e encontre o plano para a sua operação.</p></div><Button asChild size="lg"><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle/> Falar no WhatsApp <ArrowUpRight/></a></Button></section>
    </main>
    <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-muted-foreground md:px-10"><div><strong className="text-sm text-foreground">Ponto Pro Gestão · Atalaia Sistemas</strong><p className="mt-2">Portaria 671/2021 MTE · Registro e gestão de jornada</p></div><Link to="/" className="flex items-center gap-2 font-semibold hover:text-primary">Acessar o sistema <ArrowUpRight size={15}/></Link></div></footer>
  </div>;
}