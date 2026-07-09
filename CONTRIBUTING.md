# Contributing — ProjectPulse

## Commit message convention

This repo follows **Conventional Commits**:

```
<type>(<scope>): <short summary>

<optional body>
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`
**Scope** is optional but encouraged — the entity/area touched, e.g. `projects`, `tasks`,
`time-logs`, `auth`, `db`, `reports`.

Examples:

```
feat(tasks): let a member close their own assigned task
fix(rls): allow member UPDATE on tasks assigned to them (migration 08)
test(cost): cover rate-snapshot immutability
docs(spec): check off Phase 3 checklist
chore(deps): drop xlsx (unpatched HIGH severity advisory)
```

Keep the summary line ≤ 72 chars, imperative mood ("add", not "added"/"adds"). Use the body to
explain *why*, not what — the diff already shows what changed.

## Before opening a PR

1. `npm run lint` and `npm run format:check` — clean.
2. `npm run test:unit` — must pass (also runs automatically via the edit hook, see
   `.claude/settings.json`).
3. `npm run test:integration` — run this manually when you've touched a Supabase migration,
   trigger, or RLS policy (it hits the live dev project; not run automatically).
4. `npm run build` — must succeed.
5. If you changed the database schema/RLS: run the Supabase MCP `get_advisors({type:
   "security"})` and confirm it's clean (aside from the deferred `leaked_password_protection`
   item — Phase 5 scope).

Use the `code-reviewer` and `security-auditor` sub-agents (`.claude/agents/`) to review your
changes before requesting human review, especially for anything touching Server Actions,
migrations, or RLS.

## Pull requests

Use the template at `.github/pull_request_template.md` (applied automatically on GitHub). Keep
PRs scoped to one phase/feature where possible — this project was built phase-by-phase per
`docs/spec.md`, and PRs that map to that structure are easier to review.

## Sharing `.claude/` config

`.claude/agents/`, `.claude/hooks/`, and `.claude/settings.json` are **committed** — they're team
tooling (sub-agents, the lint/format/test-on-edit hook), not personal preferences. Only
`.claude/settings.local.json` (personal MCP toggles, local overrides) stays gitignored.
`.mcp.json` is also committed — it declares which MCP servers the project uses (Supabase, GitHub);
it contains no secrets, only a `${GITHUB_PERSONAL_ACCESS_TOKEN}` env-var reference. Each
contributor exports that token locally (`https://github.com/settings/tokens`, scopes: `repo`,
`read:org`) — never commit a real token.
