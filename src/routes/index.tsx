import { createFileRoute } from "@tanstack/react-router";

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

function Index() {
  // O aplicativo completo é um único arquivo HTML/CSS/JS puro em /vip-ponto.html
  return (
    <iframe
      src="/vip-ponto.html?v=20261019-revisao-visual"
      title="Ponto Pro Gestão"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
