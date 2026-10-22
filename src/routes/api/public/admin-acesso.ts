import { createFileRoute } from "@tanstack/react-router";
import { MASTER_EMAIL } from "@/lib/developer-info";

// Primeiro acesso / redefinição de senha do Super Admin.
// O e-mail é fixo no servidor: ninguém consegue disparar convites para outro endereço.
export const Route = createFileRoute("/api/public/admin-acesso")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const redirectTo = `${origin}/admin/senha`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let userId: string | undefined;
        const invite = await supabaseAdmin.auth.admin.inviteUserByEmail(MASTER_EMAIL, { redirectTo });
        if (!invite.error) userId = invite.data.user?.id;
        else {
          const link = await supabaseAdmin.auth.admin.generateLink({ type: "recovery", email: MASTER_EMAIL });
          userId = link.data?.user?.id;
          const sent = await supabaseAdmin.auth.resetPasswordForEmail(MASTER_EMAIL, { redirectTo });
          if (sent.error) return Response.json({ error: "Não foi possível enviar o e-mail agora." }, { status: 500 });
        }
        if (userId) {
          await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" } as never, { onConflict: "user_id,role" } as never);
        }
        return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
