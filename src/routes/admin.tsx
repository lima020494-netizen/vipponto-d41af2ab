import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout próprio da área Super Admin (separada do app do cliente).
export const Route = createFileRoute("/admin")({
  ssr: false,
  component: () => (
    <div className="admin-shell min-h-screen">
      <Outlet />
    </div>
  ),
});
