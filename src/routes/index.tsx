import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MASTER_EMAIL } from "@/lib/developer-info";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ponto Pro Gestão — Registro Eletrônico de Ponto (Portaria MTE 671/2021)" },
      {
        name: "description",
        content:
          "Controle de ponto multi-empresa: PIN, comprovante térmico 58mm, escala semanal, banco de horas e folha de ponto padrão MTE em PDF e XML.",
      },
      { property: "og:title", content: "Ponto Pro Gestão — Registro Eletrônico de Ponto" },
      {
        property: "og:description",
        content:
          "Ponto Pro Gestão: registro de ponto, comprovante térmico, escala e banco de horas, desenhado em conformidade com as diretrizes da Portaria MTE 671/2021.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const APP_SRC = "/vip-ponto.html?v=20261024-planos-faltas";

/** E-mail do token de um link de recuperação (para separar Super Admin de clientes). */
function emailDoLink(hash: string) {
  try {
    const tk = new URLSearchParams(hash.replace(/^#/, "")).get("access_token");
    if (!tk) return "";
    const b = tk.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/");
    return String(JSON.parse(atob(b)).email || "").toLowerCase();
  } catch { return ""; }
}

function Index() {
  // O aplicativo completo é um único arquivo HTML/CSS/JS puro em /vip-ponto.html
  const [src, setSrc] = useState(APP_SRC);
  useEffect(() => {
    const { hash, search } = window.location;
    if (!/type=recovery/.test(hash + search)) return;
    if (emailDoLink(hash) === MASTER_EMAIL) { window.location.replace(`/admin/senha${search}${hash}`); return; }
    setSrc(`${APP_SRC}${hash}`); // clientes: repassa os tokens para a tela de nova senha do app
  }, []);
  return (
    <iframe
      src={src}
      title="Ponto Pro Gestão"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
