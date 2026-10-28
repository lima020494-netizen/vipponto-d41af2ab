import { createFileRoute } from "@tanstack/react-router";
import { OperationalApp } from "@/components/operational-app";

export const Route = createFileRoute("/quiosque")({
  head: () => ({ meta: [
    { title: "Quiosque de Ponto — Ponto Pro Gestão" },
    { name: "description", content: "Terminal de registro de ponto e portal do colaborador do Ponto Pro Gestão." },
    { property: "og:title", content: "Quiosque de Ponto — Ponto Pro Gestão" },
    { property: "og:description", content: "Registro de ponto com comprovantes e acesso à folha do colaborador." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <OperationalApp mode="quiosque" />,
});