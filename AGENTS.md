<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- VIP PONTO data: Supabase is the source of truth (tables empregador, funcionarios, pontos, logs, escala isolated by email_dono; dados/feriados by conta); localStorage is only an offline cache and punches go through a pending queue — so kiosk devices and phones share the same data and never lose offline punches.
- Monthly employee sheet links use opaque, expiring, server-validated tokens; never expose owner email or employee PIN in URLs.
- Licensing state (licencas/app_config) is written only by the /api/public/licenca server route; the dev panel requires the admin role (user_roles) plus master PIN, checked server-side — client code can't grant itself access.
