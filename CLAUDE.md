# CLAUDE.md — ProjectPulse

ระบบติดตามความคืบหน้า Project / Resource / Man-Day / Cost ภายในองค์กร
Spec ฉบับเต็ม: `docs/spec.md` · แผนงาน 5 Phase อยู่ในไฟล์เดียวกัน

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — PostgreSQL + Auth + RLS (project ref `khizdvwjvwtrzyupqgpl`)
- **Vercel** (deploy target)
- ทำงานร่วมกับ Supabase ผ่าน **MCP** (`.mcp.json`)

## ⚠️ Next.js 16 — สิ่งที่ต่างจากเวอร์ชันเดิม

- Middleware ถูกเปลี่ยนชื่อเป็น **`proxy`** — ไฟล์คือ `src/proxy.ts`, export `function proxy()`, รันบน **nodejs runtime** (ไม่มี edge)
- `cookies()`, `headers()`, `params`, `searchParams` เป็น **async** ต้อง `await` เสมอ
- **Turbopack เป็น default** — scripts ไม่ต้องใส่ `--turbopack`
- `next lint` ถูกถอด — ใช้ `eslint` โดยตรง (`npm run lint`)
- ก่อนเขียน API ที่ไม่แน่ใจ ให้อ่าน docs ที่ bundle มา: `node_modules/next/dist/docs/`

## คำสั่งที่ใช้บ่อย

```bash
npm run dev               # dev server (http://localhost:3000)
npm run build             # production build (Turbopack)
npm run lint              # ESLint
npm run format            # Prettier --write
npm run test:unit         # fast, offline (also runs automatically on src/**/*.ts edits — see Hooks)
npm run test:integration  # hits the live dev Supabase project — run manually, not automated
```

## โครงสร้าง

```
src/
  proxy.ts                     # auth session refresh + route guard (เดิมคือ middleware)
  app/
    page.tsx                   # landing page
    login/page.tsx             # หน้า Login (username + password)
    dashboard/page.tsx         # Basic Dashboard (counts, planned/actual MD, recent projects)
    time-logs/page.tsx         # "My Time Logs" — log time + list/delete own logs
    projects/page.tsx          # list + filter + create (admin/pm)
    projects/[id]/page.tsx     # overview + edit (admin/pm) / read-only (others)
    projects/[id]/tasks/page.tsx           # task list + create (admin/pm)
    projects/[id]/tasks/[taskId]/page.tsx  # task edit + time logs for that task
    projects/[id]/members/page.tsx         # member list + add/remove (admin/pm)
    projects/[id]/planned-vs-actual/page.tsx  # Duration/MD/Cost planned vs actual
    resources/page.tsx, resources/[id]/page.tsx  # Resource Dashboard + drill-down
    reports/page.tsx, reports/project-summary|resource-workload|cost/page.tsx
  components/
    DashboardCard.tsx, ProgressBar.tsx, StatusBadge.tsx (Project/TaskStatusBadge)
    VarianceBadge.tsx, ResourceUtilizationBar.tsx, ExportButton.tsx, DateRangeFilter.tsx
    ProjectTable.tsx, TaskTable.tsx, RoleGuard.tsx, AppNav.tsx
    forms/*                    # client forms (useActionState) per entity
  lib/
    supabase/client.ts         # browser client
    supabase/server.ts         # server client (await cookies())
    supabase/proxy-session.ts  # updateSession() ใช้ใน proxy.ts
    auth.ts                    # getCurrentProfile / requireProfile / canManageProjects
    activity.ts                # logActivity() — insert into activity_logs
    auth-actions.ts            # login / logout server actions
    actions/projects.ts, members.ts, tasks.ts, time-logs.ts  # CRUD Server Actions
    form-utils.ts              # formStr/formNum FormData helpers
    metrics.ts                 # variance/utilization/overdue pure calc helpers
    export.ts                  # exportToCsv / exportToExcel / exportToPdf (client-side)
    constants.ts               # labels, MAN_DAY_HOURS, username->email
    database.types.ts          # generated จาก Supabase (อย่าแก้มือ)
```

## Auth model

- Login ด้วย **Username + Password**. Username ถูก map เป็น Supabase Auth email:
  `<username>@projectpulse.local` (ดู `usernameToEmail` ใน `lib/constants.ts`)
- Trigger `public.handle_new_user` สร้างแถวใน `public.profiles` ให้อัตโนมัติเมื่อมี auth user ใหม่
- RLS: อ่านได้ทุก authenticated · เขียน Project/Task/Member = admin+pm · task UPDATE ก็อนุญาต
  ให้ `assigned_to = auth.uid()` ด้วย (member แก้ progress/status/remark งานตัวเองได้) ·
  time_logs = เจ้าของแถวหรือ admin (helper `public.current_app_role()`, SECURITY INVOKER)
- **RLS UPDATE/DELETE ไม่ raise error เมื่อถูกบล็อก** — แค่ affect 0 rows เงียบๆ (ต่าง
  จาก INSERT ที่ raise 42501) ทุก Server Action ที่ update/delete ต้องเช็ค
  `.select("id")` แล้วดูว่า array ว่างไหม ไม่ใช่เช็คแค่ `error`
- `activity_logs` มีแค่ policy select/insert (ไม่มี update/delete) — เป็น audit trail
  ที่ตั้งใจให้ immutable แม้แต่ admin ก็ลบไม่ได้ผ่าน RLS ปกติ

## Actual Man-Day / Progress % (derived, ไม่ใช่ manual)

- DB trigger (`06_actual_calc_triggers`) คำนวณอัตโนมัติทุกครั้งที่ time_logs หรือ
  tasks.progress_percent/planned_man_day เปลี่ยน:
  `tasks.actual_hour/actual_man_day` ← sum(time_logs.work_hour) ของ task นั้น / 8
  `projects.actual_man_day` ← sum(tasks.actual_man_day) ของ project
  `projects.progress_percent` ← weighted avg (tasks.progress_percent × planned_man_day)
  `project_members.actual_man_day` ← sum(time_logs.work_hour) ของ (project, user) / 8
- Trigger functions เป็น **SECURITY DEFINER** (ไม่งั้น member insert time_log ของตัวเอง
  จะ update tasks/projects ไม่ได้เพราะ RLS ไม่ให้ member เขียนตารางนั้น) แต่ revoke
  EXECUTE จาก anon/authenticated ไว้แล้ว (เรียกได้แค่จาก trigger เท่านั้น ไม่ใช่ RPC)
- ห้ามแก้ actual_hour/actual_man_day/progress_percent (project/task) ตรงๆ จาก app —
  ต้อง insert/update/delete time_logs หรือแก้ tasks.progress_percent ให้ trigger คำนวณให้

## Cost Calculation (Phase 3, derived เช่นเดียวกับ Man-Day)

- ทุก `time_logs` มี `cost_logs` แถวคู่กัน (1:1 ผ่าน `cost_logs.time_log_id`) สร้าง/ลบอัตโนมัติ
  โดย trigger เดียวกับที่คำนวณ Man-Day (migration `10_cost_calc_triggers`)
- **`cost_rate_per_day` เป็น snapshot ณ เวลาบันทึก time_log ครั้งแรก** — แก้ rate ใน
  `profiles` ภายหลังไม่กระทบ cost_log เดิม (ตาม §9.3) ห้ามเขียน cost_logs ตรงจาก app
- `projects.actual_cost` = sum(cost_logs.total_cost) ของ project, roll up อัตโนมัติ
- Export ใช้ `lib/export.ts` — **ไม่ใช้ package `xlsx`** (มี CVE prototype-pollution/ReDoS
  ที่ยังไม่มี fix บน npm registry) แทนที่ด้วย HTML-table-as-`.xls` (Excel เปิดได้ปกติ,
  zero-dependency) — ถ้าจะเพิ่ม export format ใหม่ อย่าเผลอ `npm install xlsx`

## Database

- Schema/RLS/seed/triggers อยู่ใน Supabase migrations `01`–`11` (ดูรายการผ่าน
  Supabase MCP `list_migrations`)
- Regenerate types หลังแก้ schema: ใช้ Supabase MCP `generate_typescript_types`
  แล้ววางลง `src/lib/database.types.ts`
- Seed users (dev): `admin`, `somchai` (pm), `wichai` / `nara` (member) — รหัสผ่าน `ProjectPulse#2026`
- รันตรวจความปลอดภัยหลังแก้ schema เสมอ: Supabase MCP `get_advisors({type:"security"})`

## Testing (Phase 4)

- **`tests/unit/`** — pure functions only (`src/lib/metrics.ts`). Fast, offline, no Supabase.
- **`tests/integration/`** — business logic that only exists as a DB trigger (Man-Day rollup,
  weighted Progress %, Cost snapshotting) and RLS boundaries, run against the live dev Supabase
  project with the seeded users. Always create throwaway rows (`TEST-` prefixed project codes via
  `tests/integration/helpers.ts`) and clean up in `afterEach`/`finally` — never touch seed data.
  Supabase Auth rate-limits `signInWithPassword`; sign in **once per role per file** in `beforeAll`
  and reuse the client, don't sign in per-test.
- Extending either suite? Use the `test-writer` sub-agent (`.claude/agents/test-writer.md`).

## Hooks & sub-agents (Phase 4, team-shared via git)

- `.claude/settings.json` → `PostToolUse` hook on `Write|Edit` runs `.claude/hooks/on-edit.mjs`:
  for any edited `src/**/*.ts(x)` file it runs `eslint --fix` + `prettier --write` on that file,
  then `npm run test:unit` (fast/offline — the integration suite is intentionally excluded from
  the hook). Uses Node to parse the hook's stdin JSON, not `jq` — `jq` isn't installed in this
  environment, don't assume it is when editing the hook script.
- `.claude/agents/{code-reviewer,test-writer,security-auditor}.md` — project-tailored sub-agents.
  Use `code-reviewer` before committing anything touching Server Actions/RLS/migrations, and
  `security-auditor` after any schema change or before a deploy.
- All of the above are committed to git (see `CONTRIBUTING.md`) — only `.claude/settings.local.json`
  (personal MCP toggles) is gitignored.

## Deployment (Phase 5)

- Runbook เต็มอยู่ที่ `docs/deployment.md` — environments, env vars, security hardening,
  custom domain (deferred), monitoring, backup/rollback (Supabase PITR deferred), go-live
  checklist
- `GET /api/health` (`src/app/api/health/route.ts`) — lightweight DB round-trip สำหรับ
  uptime monitor/smoke test
- `@vercel/analytics` ต่อไว้ใน `src/app/layout.tsx` แล้ว — ต้องกดเปิด "Web Analytics" ใน
  Vercel dashboard เองครั้งเดียวหลัง deploy (ไม่มี CLI flag)
- คำสั่ง `vercel` ที่ใช้บ่อย:

```bash
vercel link                              # ผูก repo นี้กับ Vercel project (ครั้งแรกครั้งเดียว)
vercel env pull .env.local                # ดึง env vars จาก Vercel ลงมาใช้ local
vercel --prod                             # deploy manual ขึ้น production (ปกติ push main พอ)
vercel rollback                           # instant rollback ไป deployment ก่อนหน้า
```

## MCP servers (`.mcp.json`, committed)

- `supabase` — already authenticated (project ref `khizdvwjvwtrzyupqgpl`).
- `github` — GitHub's official remote server (`https://api.githubcopilot.com/mcp/`). Requires each
  contributor to `export GITHUB_PERSONAL_ACCESS_TOKEN=...` locally (the token itself is never
  committed — `.mcp.json` only references `${GITHUB_PERSONAL_ACCESS_TOKEN}`).

## Environment (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # publishable key
SUPABASE_SERVICE_ROLE_KEY=          # server-only, ห้าม expose ฝั่ง browser
NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN=projectpulse.local
```
