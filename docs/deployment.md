# Deployment Runbook — Phase 5 (Production)

> Companion to the Phase 5 checklist in `docs/spec.md` §4. This file covers everything that's a
> manual/dashboard step or an operational runbook rather than code.

## 1. Environments

Vercel gives 3 environments per project, tied to the linked GitHub repo:

| Environment | Trigger | Env vars source |
|---|---|---|
| Development | `npm run dev` locally | `.env.local` (never committed) |
| Preview | any push to a non-`main` branch / PR | Vercel Preview env vars |
| Production | push/merge to `main` | Vercel Production env vars |

Link the project once: `vercel link` (creates `.vercel/project.json`, gitignored). Connect the
GitHub repo (`Tharanut/ProgressTrackingSystem`) from the Vercel dashboard (or `vercel git
connect`) so Preview/Production deploys happen automatically on push — no manual `vercel deploy`
needed after that.

## 2. Environment variables

Same 4 vars as `.env.local` / `.env.example`, set per environment in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never mark "expose to browser"
- `NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN production
# repeat with `preview` and `development` as the environment name
```

To pull Vercel's env vars back down for local `vercel dev` parity: `vercel env pull .env.local`.

## 3. Security hardening

- RLS performance advisor warnings (`auth_rls_initplan`, `multiple_permissive_policies`) were
  fixed in migration `11_rls_performance_hardening` (applied via Supabase MCP — no local file,
  same as migrations 01–10; see `mcp__supabase__list_migrations`). Verified via
  `get_advisors({type:"performance"})` → clean, and the full integration suite (13/13) still
  passes, confirming no authorization regression.
- **Remaining manual step:** `auth_leaked_password_protection` (security WARN) can only be
  toggled in the Supabase Dashboard → **Authentication → Policies → Password Security** → enable
  "Leaked password protection". Not exposed via any MCP tool or migration. Do this before
  go-live.

## 4. Custom domain — deferred

No domain purchased yet; production runs on the default `*.vercel.app` URL. When ready:

1. Vercel dashboard → project → **Settings → Domains** → add the domain.
2. Vercel shows the exact DNS record to create (usually a `CNAME` to `cname.vercel-dns.com`, or an
   `A` record if using the apex domain) — add it at your DNS provider.
3. Vercel provisions the TLS cert automatically once DNS resolves (no manual cert work).

## 5. Monitoring

- **Vercel Web Analytics** — `@vercel/analytics` is wired into `src/app/layout.tsx`. One-time
  manual step: Vercel dashboard → project → **Analytics** tab → enable. No-op locally; only
  collects data once deployed.
- **Health check** — `GET /api/health` (`src/app/api/health/route.ts`) does a lightweight
  Supabase round-trip and returns `{"status":"ok"}` (200) or `{"status":"error"}` (503). Point any
  uptime monitor at `https://<deployment-url>/api/health`.
- **Supabase logs** — use the `get_logs` MCP tool, or the Supabase Dashboard **Logs** section, for
  Postgres/Auth/API logs.
- **Vercel build/runtime logs** — dashboard → project → **Deployments** → pick a deployment →
  **Logs**.

## 6. Backup / Rollback

**Vercel (app rollback):** every deployment is immutable. To roll back:

```bash
vercel rollback              # interactive picker, or:
vercel rollback <deployment-url>
```

Equivalent one-click "Instant Rollback" is in the dashboard under **Deployments**.

**Supabase (data rollback):**

- **PITR is deferred** (paid add-on, cost decision left to the user) — not enabled this pass.
  When the project upgrades plan, enable it in Dashboard → **Database → Backups → Point in Time
  Recovery**.
- Until then, rely on Supabase's automatic **daily backups** (available on paid plans; free tier
  has none — check current plan in Dashboard → **Database → Backups**). Restoring: Dashboard →
  **Database → Backups → Restore** next to the desired backup snapshot. This restores the whole
  project to that point — there is no partial/table-level restore without PITR.
- Schema itself can always be rebuilt from migrations 01–11 via `apply_migration` in order if a
  fresh project is ever needed — the migration history is the source of truth for schema, backups
  are for data.

## 7. Go-live checklist

Run against the real deployed URL (Preview first, then Production) before announcing go-live:

- [ ] `GET /api/health` returns `{"status":"ok"}`
- [ ] Login works for each seeded role: `admin`, `somchai` (pm), `wichai`/`nara` (member) —
      password `ProjectPulse#2026`
- [ ] `admin`/`pm`: create a project, add a member, create a task, log time — Actual Man-Day and
      Cost roll up automatically (per triggers 06/10)
- [ ] `member`: can update progress/status/remark only on tasks assigned to them; cannot open
      admin/PM-only pages (RoleGuard redirect/403)
- [ ] `management`/`viewer`: dashboards render, no write actions available
- [ ] Export (Excel/PDF/CSV) works on at least one report page
- [ ] `mcp__supabase__get_advisors({type:"security"})` clean except the deferred leaked-password
      item (§3); `{type:"performance"}` clean except `unused_index` (INFO, informational only)
- [ ] Env vars correct per environment (spot-check one Server Action that needs
      `SUPABASE_SERVICE_ROLE_KEY`, if any exist, and the public Supabase URL/key)
- [ ] Vercel Analytics tab shows the smoke-test pageviews
