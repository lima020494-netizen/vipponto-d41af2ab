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
- Ponto Pro Gestão data: Supabase is the source of truth (tables empregador, funcionarios, pontos, logs, escala isolated by email_dono; dados/feriados by conta); localStorage is only an offline cache and punches go through a pending queue — so kiosk devices and phones share the same data and never lose offline punches.
- Monthly employee sheet links use opaque, expiring, server-validated tokens; never expose owner email or employee PIN in URLs.
- Licensing state (licencas/app_config) is written only by the /api/public/licenca server route; the dev panel requires the admin role (user_roles) plus master PIN, checked server-side — client code can't grant itself access.

- Keep legacy storage namespaces and the HTML entry URL stable during rebranding to preserve offline punches, sessions, and existing sheet links; app logo defaults use the versioned CDN pointer asset.

- Accountant ZIP exports reuse the same employee PDF and AFD content generators as individual downloads, so fiscal outputs and calculations cannot diverge.
- A4 PDF exports use the shared local jsPDF AutoTable renderer for tabular data, wrapping cells and repeating headers within reserved footer margins; sheet exports keep the same official generator in every delivery path.
- Commercial content lives only at /conheca with a scoped palette; the root route retains the operational HTML iframe to avoid kiosk regressions.
- Both About entry points read app_config.dev_info with shared offline cache; profile and raster logo writes go through the existing license endpoint with server-verified master email, admin role and PIN to prevent client privilege escalation.
