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
- All A4 PDFs (sheet, bank, certificate, accountant ZIP) use the shared local jsPDF AutoTable renderer and the same generators as on-screen documents, so outputs and calculations never diverge; only kiosk receipts use the thermal browser-print path.
- Monthly sheet summary rows are derived once from existing daily and bank results and reused by the screen and official PDF; period bank movement stays distinct from accumulated balance to avoid divergent totals.
- Sheets share presentation, company weekday/Saturday hours and palette with AutoTable; A4 signatures remain on the main sheet and overflowing notes go into an appendix.
- Commercial content lives only at /conheca with a scoped palette; the root route retains the operational HTML iframe to avoid kiosk regressions. Reads include validated defaults; writes (conheca/dev_info) go through the protected license endpoint, never browser database writes.
- Both About entry points read app_config.dev_info with shared offline cache; profile and raster logo writes go through the existing license endpoint with server-verified master email, admin role and PIN to prevent client privilege escalation.
- Dismissed manager onboarding is stored in an account-scoped legacy namespace key so one company's choice cannot hide another company's onboarding.
- Hardware bridge identifiers remain unchanged while presentation text is neutralized; regulatory wording in legacy commercial content is normalized at read time without overwriting stored configuration.
- Kiosk browser libraries are version-pinned public scripts, cached with the operational HTML by a static-only service worker; API/auth/company responses are excluded so offline assets never become a second data source.
- Manager drawer shortcuts close immediately and defer module renderers through animation frames; manager home renders the executive summary in gestor-hub and the frequency dashboard in gestor-body through the shared deferred renderer, without duplicate filter IDs; dashboard indicators are read-only and session caches never replace Supabase synchronization.
- Holidays/rest use zero planned time; Sunday/holiday bank uses employer factor, never salary premiums. Generic rest never infers debt.
- Shared occurrence rules drive sheet/bank/XLS. Periods expand into dated synced records and edit/delete as a unit; external work never synthesizes fiscal punches. Vacation is neutral, explicit compensation distinct from absence.
- Export libraries (jspdf/autotable/jszip/xlsx) load on demand via garantirLib(), never in the initial head; every export entry point awaits it first.
- Initial cloud punch load is windowed to the current month (NUVEM_DESDE); garantirHistorico(dataIni) back-fills older punches on demand for sheet, bank, batch and accountant exports.
- Schedule grid and legacy imports share lerCelulaEscala and canonical TIPOS_ESC values, so menu options and accepted rest-day aliases retain existing calculation semantics.
- Monthly ZIP is an action inside the sheet and adds a BIFF8 analytical workbook; reporting codes and deduction minutes are not eSocial transmission or wage calculation.
- Super Admin lives only at /admin (own layout, master email + admin role + reserve PIN checked by the license endpoint); the client HTML app has no developer screens. Install icons use versioned filenames so installed shortcuts refresh.
- Plan definitions live in app_config key 'planos' (src/lib/plans.ts schema + PLANOS_PADRAO fallback 10/25/50); the license route serves them to the client app and only master+PIN writes them. No app_plans table: app_config is the established shared-config store.
- Bank debits come only from Folga Compensatória or incomplete shift (early departure): unjustified absence is wage-deduction only with neutral bank balance, and late arrival (atrasoDia, 10-min tolerance) is a Dashboard-only metric, never a bank debit or sheet column.
- Support mode UI is a compact fixed bottom pill, never a top banner, so the manager header, drawer and kiosk stay fully usable.
