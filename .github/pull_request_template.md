## Summary

<!-- What changed and why. Link the spec section (docs/spec.md) or phase this belongs to. -->

## Changes

-

## Test plan

- [ ] `npm run lint` / `npm run format:check` clean
- [ ] `npm run test:unit` passes
- [ ] `npm run test:integration` passes (if this touches a migration/trigger/RLS policy)
- [ ] `npm run build` succeeds
- [ ] Manually exercised the affected page(s)/role(s) — note which below

<!-- e.g. "Logged in as pm, created a project, added a member, verified RLS blocked member insert" -->

## Database changes

- [ ] N/A — no schema/RLS change
- [ ] Migration included, `get_advisors({type: "security"})` checked clean
- [ ] `src/lib/database.types.ts` regenerated from the new schema

## Checklist

- [ ] Reviewed by the `code-reviewer` sub-agent (or a human) — no open findings
- [ ] No `xlsx` package reintroduced (see `CLAUDE.md` — removed for an unpatched HIGH severity CVE)
- [ ] Derived columns (`actual_hour`, `actual_man_day`, `progress_percent`, `actual_cost`,
      `cost_logs`) are not written directly — only via `time_logs`/`tasks.progress_percent`
