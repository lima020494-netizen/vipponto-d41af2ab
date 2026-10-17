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
- Monthly sheet summary rows are derived once from existing daily and bank results and reused by the screen and official PDF; period bank movement stays distinct from accumulated balance to avoid divergent totals.
- Employee sheets share presentation helpers and computed CSS palette with the compact AutoTable renderer for institutional identification, company work-hours rows (separate Saturday fields stored in the existing employer payload), daily rows, totals and framed bank/notes; monthly A4 signatures stay on the main sheet and overflowing notes are preserved in an appendix rather than clipped.
- A4 documents are downloaded through jsPDF rather than browser printing; only kiosk receipts use the thermal browser-print path, preventing mixed document formats.
- Commercial content lives only at /conheca with a scoped palette; the root route retains the operational HTML iframe to avoid kiosk regressions.
- Both About entry points read app_config.dev_info with shared offline cache; profile and raster logo writes go through the existing license endpoint with server-verified master email, admin role and PIN to prevent client privilege escalation.
- The master listing response always includes validated commercial content with defaults for absent configuration; commercial writes reuse the protected license endpoint, never browser database writes.
- Dismissed manager onboarding is stored in an account-scoped legacy namespace key so one company's choice cannot hide another company's onboarding.
- Hardware bridge identifiers remain unchanged while presentation text is neutralized; regulatory wording in legacy commercial content is normalized at read time without overwriting stored configuration.
- Kiosk browser libraries are version-pinned public scripts, cached with the operational HTML by a static-only service worker; API/auth/company responses are excluded so offline assets never become a second data source.
- Bank and technical-certificate PDF exports use the shared A4 table renderer and footer, preserving the same calculations and declaration text as their on-screen documents.
- Manager drawer shortcuts close immediately and defer existing module/subtab renderers through animation frames; dashboard indicators are read-only and session caches never replace Supabase synchronization.
- Manager home renders the executive summary in gestor-hub and the existing frequency dashboard in gestor-body through the shared deferred renderer, so entry and drawer navigation share one complete dashboard without duplicate filter IDs.
- Holiday and explicit rest-day calculations use zero planned time before standard shifts; bank credits represent worked minutes, not monetary premiums, and generic rest days never create inferred compensation debits.
- Daily occurrence bank decisions are shared by sheet and bank calculations, so explicit compensation debits stay distinct from missing hours and excused occurrences cannot generate bank debt across delivery paths.
