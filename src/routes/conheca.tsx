import { createFileRoute } from "@tanstack/react-router";
import { ConhecaPage, conhecaHead } from "@/components/conheca-page";

export const Route = createFileRoute("/conheca")({
  head: () => conhecaHead(),
  component: ConhecaPage,
});