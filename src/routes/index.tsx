import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MASTER_EMAIL } from "@/lib/developer-info";
import { ConhecaPage, conhecaHead } from "@/components/conheca-page";

export const Route = createFileRoute("/")({
  head: () => conhecaHead(true),
  component: Index,
});

const APP_SRC = "/vip-ponto.html?v=20261031-operacional&modo=quiosque";

/** E-mail do token de um link de recuperação (para separar Super Admin de clientes). */
function emailDoLink(hash: string) {
  try {
    const tk = new URLSearchParams(hash.replace(/^#/, "")).get("access_token");
    if (!tk) return "";
    const part = tk.split(".")[1];
    if (!part) return "";
    const b = part.replace(/-/g, "+").replace(/_/g, "/");
    return String(JSON.parse(atob(b)).email || "").toLowerCase();
  } catch { return ""; }
}

function Index() {
  // Existing recovery links retain their tokens; ordinary visits show the storefront.
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const { hash, search } = window.location;
    if (!/type=recovery/.test(hash + search)) return;
    if (emailDoLink(hash) === MASTER_EMAIL) { window.location.replace(`/admin/senha${search}${hash}`); return; }
    setSrc(`${APP_SRC}${hash}`); // clientes: repassa os tokens para a tela de nova senha do app
  }, []);
  if (!src) return <ConhecaPage />;
  return (
    <iframe
      src={src}
      title="Ponto Pro Gestão"
      allow="bluetooth"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
