# ProjectPulse — Project Specification

> ระบบ Web Application สำหรับติดตามความคืบหน้าของ Project, การใช้ Resource, Man-Day และ Cost ภายในองค์กร
> Stack: **Next.js + Tailwind CSS + Supabase + Vercel**
> เอกสารฉบับนี้เกลามาจาก `docs/Project.MD` และจัดโครงสร้างตามรูปแบบ `docs/back/spec_sample.txt`

---

## 1. System Overview

### 1.1 วัตถุประสงค์

ProjectPulse ช่วยให้ Project Manager และ Management บันทึกและเปรียบเทียบ **Planned vs Actual** ของแต่ละ Project
เพื่อดูความแตกต่างของเวลา, ต้นทุน (Man-Day / Cost) และการใช้ Resource ทั้งในระดับภาพรวมและราย Project

เป้าหมายหลัก:
1. บันทึก Project, จำนวนคน, หน้าที่ของแต่ละคน และ Task ที่ได้รับมอบหมาย
2. วางแผนเวลา (Planned) และบันทึกเวลาที่เกิดขึ้นจริง (Actual)
3. คำนวณ Man-Day, Cost และ Variance
4. แสดง Dashboard ภาพรวม + Drill Down ราย Project / รายคน / ราย Task
5. วิเคราะห์ Project Delay, Resource Overload และ Cost Over Plan

### 1.2 ผู้ใช้งานและสิทธิ์ (Roles)

| Role | คำอธิบาย |
|---|---|
| `admin` | จัดการข้อมูลทั้งหมดในระบบ |
| `pm` (Project Manager) | สร้าง Project, Assign Task และดู Report ของ Project ตนเอง |
| `member` (Team Member) | ดู Task ของตนเอง, บันทึก Time Log และอัปเดตความคืบหน้า |
| `management` | ดู Dashboard ภาพรวมและรายงาน (read-only เชิงบริหาร) |
| `viewer` | ดูข้อมูลอย่างเดียว |

### 1.3 Technology Stack

| Layer | Technology | หมายเหตุ |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript | Web App, Dashboard, Form, Report |
| UI Styling | Tailwind CSS | Responsive: Desktop / Tablet / Mobile browser |
| Backend Logic | Next.js Server Actions / API Routes | Business Logic, Calculation, Validation |
| Database | Supabase PostgreSQL | Project, Task, Resource, Time Log, Cost |
| Authentication | Supabase Auth | Login ด้วย **Username + Password** (ดู §2.4) |
| Authorization | Supabase Row Level Security (RLS) | ควบคุมสิทธิ์การเข้าถึงข้อมูลตาม Role |
| File Storage | Supabase Storage | เอกสารแนบของ Project / Task |
| Hosting | Vercel | Deploy Next.js (Dev / Preview / Production) |
| Config | Vercel Environment Variables | URL, API Key, Secret |

### 1.4 System Architecture

```text
User (Admin / PM / Team Member / Management / Viewer)
        ↓
Frontend: Next.js (App Router) + Tailwind CSS
        ↓
Backend Logic: Next.js Server Actions / API Routes
        ↓
Supabase Auth  +  Supabase PostgreSQL (RLS)  +  Supabase Storage
        ↓
Dashboard / Report / Export (Excel · PDF · CSV)
        ↓
Deploy on Vercel
```

---

## 2. Data Model

Database ใช้ Supabase PostgreSQL — identifier เป็น `snake_case`, PK เป็น `uuid` (default `gen_random_uuid()`),
timestamp เป็น `timestamptz`. ทุกตารางเปิด **RLS**

### 2.1 Enums

| Enum | ค่า |
|---|---|
| `user_role` | `admin` · `pm` · `member` · `management` · `viewer` |
| `project_status` | `planning` · `in_progress` · `completed` · `delayed` · `on_hold` · `cancelled` |
| `task_status` | `pending` · `in_progress` · `done` · `delayed` |
| `priority_level` | `high` · `medium` · `low` |
| `activity_action` | `create` · `update` · `delete` |

### 2.2 Tables

**`departments`**

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `department_code` | text | unique |
| `department_name` | text | not null |
| `created_at` | timestamptz | default now() |

**`profiles`** — ข้อมูลผู้ใช้งาน (1:1 กับ `auth.users`)

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK, FK → `auth.users.id` |
| `employee_code` | text | unique |
| `username` | text | **unique, not null** — ใช้ Login |
| `full_name` | text | not null |
| `email` | text | ข้อมูลติดต่อ/แจ้งเตือน — ไม่ใช่ Login หลัก (ดู §2.4) |
| `department_id` | uuid | FK → `departments.id` |
| `role` | `user_role` | not null, default `member` |
| `cost_rate_per_day` | numeric(12,2) | ต้นทุนแรงงานต่อวัน |
| `is_active` | boolean | default true |
| `created_at` | timestamptz | default now() |

**`projects`**

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `project_code` | text | unique, not null |
| `project_name` | text | not null |
| `project_owner_id` | uuid | FK → `profiles.id` |
| `department_id` | uuid | FK → `departments.id` |
| `planned_start_date` | date | |
| `planned_end_date` | date | |
| `actual_start_date` | date | nullable |
| `actual_end_date` | date | nullable |
| `status` | `project_status` | default `planning` |
| `priority` | `priority_level` | default `medium` |
| `planned_man_day` | numeric(10,2) | |
| `actual_man_day` | numeric(10,2) | derived จาก time_logs |
| `planned_cost` | numeric(14,2) | |
| `actual_cost` | numeric(14,2) | derived |
| `progress_percent` | numeric(5,2) | 0–100 (Weighted, §2.5) |
| `description` | text | |
| `created_at` | timestamptz | default now() |

**`project_members`** — คนใน Project (unique `project_id + user_id`)

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` (cascade) |
| `user_id` | uuid | FK → `profiles.id` |
| `project_role` | text | บทบาทใน Project |
| `responsibility` | text | หน้าที่รับผิดชอบ |
| `planned_man_day` | numeric(10,2) | |
| `actual_man_day` | numeric(10,2) | derived |

**`tasks`**

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` (cascade) |
| `task_name` | text | not null |
| `task_description` | text | |
| `assigned_to` | uuid | FK → `profiles.id` |
| `planned_start_date` | date | |
| `planned_end_date` | date | |
| `actual_start_date` | date | nullable |
| `actual_end_date` | date | nullable |
| `planned_hour` | numeric(8,2) | |
| `actual_hour` | numeric(8,2) | derived จาก time_logs |
| `planned_man_day` | numeric(8,2) | |
| `actual_man_day` | numeric(8,2) | derived |
| `progress_percent` | numeric(5,2) | 0–100 |
| `status` | `task_status` | default `pending` |
| `remark` | text | |
| `created_at` | timestamptz | default now() |

**`time_logs`** — เวลาทำงานจริง (แหล่งความจริงของ Actual)

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `task_id` | uuid | FK → `tasks.id` |
| `user_id` | uuid | FK → `profiles.id` |
| `work_date` | date | not null |
| `work_hour` | numeric(6,2) | not null, > 0 |
| `work_detail` | text | |
| `issue_blocker` | text | |
| `created_at` | timestamptz | default now() |

**`cost_logs`** — ต้นทุนที่คำนวณจาก Man-Day

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `task_id` | uuid | FK → `tasks.id` |
| `user_id` | uuid | FK → `profiles.id` |
| `man_day` | numeric(10,2) | |
| `cost_rate_per_day` | numeric(12,2) | snapshot ณ เวลาบันทึก |
| `total_cost` | numeric(14,2) | `man_day * cost_rate_per_day` |

**`attachments`** — เอกสารแนบ (ไฟล์เก็บใน Supabase Storage)

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` (nullable) |
| `task_id` | uuid | FK → `tasks.id` (nullable) |
| `file_name` | text | |
| `file_url` | text | Storage path/URL |
| `uploaded_by` | uuid | FK → `profiles.id` |
| `uploaded_at` | timestamptz | default now() |

**`activity_logs`** — ประวัติการเปลี่ยนแปลง (Audit Trail)

| Field | Type | Constraint / Note |
|---|---|---|
| `id` | uuid | PK |
| `entity_type` | text | เช่น `project`, `task`, `user` |
| `entity_id` | uuid | ID ของ entity |
| `action` | `activity_action` | create / update / delete |
| `old_value` | jsonb | |
| `new_value` | jsonb | |
| `changed_by` | uuid | FK → `profiles.id` |
| `changed_at` | timestamptz | default now() |

### 2.3 ความสัมพันธ์ (สรุป)

```text
departments 1─* profiles
departments 1─* projects
profiles    1─* projects (owner)
projects    1─* project_members *─1 profiles
projects    1─* tasks *─1 profiles (assigned_to)
tasks       1─* time_logs *─1 profiles
projects/tasks 1─* cost_logs / attachments / (activity_logs via entity)
```

### 2.4 Login: Username → Email Mapping

Supabase Auth ใช้ email เป็น identity หลัก แต่ผู้ใช้ต้อง Login ด้วย **username**:

- ผู้ใช้กรอก `username` + `password` ที่หน้า Login
- Backend (Server Action) lookup `profiles.username` → หา email/auth id ที่ผูกไว้ แล้วเรียก `signInWithPassword`
- ถ้าไม่มี email จริง ให้ใช้ email สังเคราะห์ที่คงที่ เช่น `<username>@projectpulse.local` ตอน provision user
- `username` ต้อง **unique** ทั้งระบบ; `email` เป็นเพียงข้อมูลติดต่อ/แจ้งเตือน

### 2.5 Business Rules

```text
Man-Day            = Work Hour / 8            (1 Man-Day = 8 ชั่วโมง)
Task Actual MD     = SUM(time_logs.work_hour ของ task) / 8
Actual Cost        = Actual Man-Day × cost_rate_per_day
Variance           = Actual − Planned
Variance %         = (Actual − Planned) / Planned × 100
```

**Project Progress % — ใช้ Option 3 (Weighted by Planned Man-Day):**

```text
Progress % = SUM(task.progress_percent × task.planned_man_day) / SUM(task.planned_man_day)
```

**Status rules (แนะนำ):**
- `delayed` เมื่อ `today > planned_end_date` และ `progress_percent < 100`
- Resource **Overload** เมื่อ `utilization % > 100%` (Actual MD เทียบ Capacity)

---

## 3. Features + Acceptance Criteria

> รูปแบบ: `[ ]` = acceptance criteria ที่ต้องผ่านทั้งหมดจึงถือว่า feature เสร็จ

### 3.1 Authentication & Role
- [ ] ผู้ใช้ Login ด้วย username + password สำเร็จ และถูก redirect ตาม role
- [ ] username/password ผิด → แสดง error โดยไม่เปิดเผยว่า field ไหนผิด
- [ ] Logout แล้ว session ถูกล้าง เข้าหน้า protected ไม่ได้
- [ ] RoleGuard: `member`/`viewer` เปิดหน้า admin/PM-only ไม่ได้ (redirect หรือ 403)

### 3.2 Project CRUD
- [ ] `admin`/`pm` สร้าง Project ได้ (project_code ซ้ำ → error)
- [ ] แก้ไข/ดูรายละเอียด Project ได้ พร้อม tabs (Overview, Members, Tasks, Timeline, Planned vs Actual, Cost, Attachment, Activity Log)
- [ ] Project List: ค้นหา + filter (status / owner / department / ช่วงเวลา) และแสดง Progress % + Delay/On-Track
- [ ] ทุกการเปลี่ยนแปลงถูกบันทึกลง `activity_logs`

### 3.3 Project Members
- [ ] เพิ่ม/ลบสมาชิกใน Project พร้อมกำหนด `project_role` + `responsibility`
- [ ] เพิ่มคนซ้ำใน Project เดียวกันไม่ได้ (unique constraint)
- [ ] หน้า Members แสดง Assigned Task, Planned/Actual MD, Utilization %, Normal/Overload

### 3.4 Task Management
- [ ] สร้าง/แก้ไข/Assign/ปิด Task ได้ ภายใต้ Project
- [ ] อัปเดต Progress % และ Status (pending/in_progress/done/delayed)
- [ ] เพิ่ม Remark และ Attachment ได้
- [ ] `member` อัปเดตได้เฉพาะ Task ที่ assign ให้ตนเอง

### 3.5 Time Log
- [ ] บันทึก Work Date, Project, Task, Work Hour (>0), Work Detail, Issue/Blocker
- [ ] เมื่อบันทึก time_log แล้ว Actual Man-Day ของ Task/Project อัปเดตอัตโนมัติ (Actual = ΣHour / 8)
- [ ] ผู้ใช้ดู/แก้เฉพาะ time_log ของตนเอง (ตาม RLS)

### 3.6 Planned vs Actual
- [ ] หน้าเปรียบเทียบแสดง Duration / Man-Day / Cost เป็น Planned, Actual, Variance, Variance %
- [ ] ค่าติดลบ/บวกมี VarianceBadge สี (Under/Over Plan) ชัดเจน

### 3.7 Man-Day & Cost
- [ ] คำนวณ Man-Day, Actual Cost, Variance ตามสูตร §2.5 ถูกต้อง
- [ ] Cost ใช้ `cost_rate_per_day` snapshot ณ เวลาบันทึก (แก้ rate ภายหลังไม่กระทบ log เดิม)

### 3.8 Dashboards
- [ ] **Overall (Management):** Total/By-Status/By-Department, Planned vs Actual MD & Cost, Resource Utilization, Top 5 Delay Project, Top 5 Overload Resource
- [ ] **Project (PM):** Progress %, Task Status, Team Workload, Timeline, Cost Variance, Delay Task, Issue/Blocker
- [ ] **Resource:** จำนวน Project/Task ต่อคน, Planned/Actual MD, Utilization %, Capacity เหลือ, รายชื่อ Overload
- [ ] Dashboard คลิก Drill Down เข้าราย Project/คน/Task ได้

### 3.9 Reports & Export
- [ ] Export ได้: Project Summary, Task Progress, Planned vs Actual, Man-Day, Resource Workload, Cost
- [ ] รองรับ Format: **Excel, PDF, CSV**

### 3.10 Activity Log / Audit
- [ ] การ create/update/delete entity หลักถูกบันทึก old_value/new_value (jsonb) + changed_by + changed_at
- [ ] หน้า Activity Log ของ Project แสดงประวัติเรียงตามเวลา

---

## 4. แผนพัฒนา 5 Phase

> แต่ละ Phase มี checklist — ติ๊ก `[x]` เมื่อเสร็จและผ่าน acceptance criteria ที่เกี่ยวข้อง

### Phase 1 — Foundation (Job 1)
ตั้งฐานโปรเจกต์ให้พร้อมต่อยอด

- [x] ติดตั้ง Next.js 16 (App Router) + TypeScript + Tailwind CSS
- [x] ตั้งค่า ESLint + Prettier + โครง folder ตาม §6
- [x] เชื่อม Supabase project (ref `khizdvwjvwtrzyupqgpl` ใน `.mcp.json`) + ตั้งค่า env vars
- [x] สร้าง schema ทั้ง 9 ตาราง + enums ผ่าน migration (`apply_migration`)
- [x] เปิด RLS baseline ทุกตาราง + policy เริ่มต้น (อ่านตาม role, เขียนตามเจ้าของ)
- [x] Seed ข้อมูลตัวอย่าง (departments, profiles/roles, 1–2 projects, tasks, time_logs)
- [x] ทำ Landing Page + base layout (nav ตาม role) + หน้า Login
- [x] เขียน `CLAUDE.md` (โครงสร้าง, คำสั่ง dev, convention)

### Phase 2 — Core Features / MVP (Job 2)
ให้ระบบใช้งานพื้นฐานได้ครบ loop

- [x] Supabase Auth: Login username+password (§2.4) + Logout + session middleware
- [x] RoleGuard + redirect ตาม role
- [x] CRUD: Projects, Project Members, Tasks (Server Actions + validation)
- [x] Time Log entry + trigger/logic คำนวณ Actual Man-Day
- [x] คำนวณ Progress % (Weighted, §2.5) + Basic Dashboard
- [x] บันทึก activity_logs สำหรับ entity หลัก
- [x] Components: DashboardCard, ProjectTable, TaskTable, ProgressBar, ProjectStatusBadge, RoleGuard

### Phase 3 — Dashboards & Analytics (Job 3)
เพิ่มมุมมองบริหารและการวิเคราะห์เชิงลึก

- [x] Overall/Management Dashboard (Status, Department, MD, Cost, Utilization, Top 5 Delay/Overload)
- [x] Planned vs Actual (Duration / Man-Day / Cost + VarianceBadge)
- [x] Cost & Variance analysis (by Project / by Resource / Task Variance)
- [x] Resource Dashboard + ResourceUtilizationBar (Overload / Capacity)
- [x] Reports + Export Excel / PDF / CSV (ExportButton, DateRangeFilter)

### Phase 4 — Agentic Quality & Team Workflow (Job 4)
ยกระดับคุณภาพโค้ดและการทำงานเป็นทีม

- [x] Sub-agents: `code-reviewer`, `test-writer`, `security-auditor` ใน `.claude/agents/`
- [x] MCP: ใช้ Supabase MCP (เชื่อมแล้ว) + เพิ่ม GitHub MCP
- [x] Hooks: lint / format / test อัตโนมัติหลังแก้ไขโค้ด
- [x] Git workflow: commit message convention + PR template + code review
- [x] แชร์ `.claude/` config ผ่าน Git ให้ทีมใช้ร่วมกัน
- [x] เขียน unit/integration test สำหรับ business logic (Man-Day, Cost, Variance, Progress)

### Phase 5 — Production (Job 5)
ขึ้นระบบจริงบน Vercel + Supabase อย่างปลอดภัย

- [ ] ตั้งค่า Vercel 3 environment: Development / Preview / Production (pending — ดู `docs/deployment.md` §1)
- [ ] Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only) (pending — ดู `docs/deployment.md` §2)
- [x] RLS/security hardening + ตรวจด้วย Supabase `get_advisors` (แก้ทุก warning) — performance
      WARNs (`auth_rls_initplan`, `multiple_permissive_policies`) แก้แล้วใน migration
      `11_rls_performance_hardening`; `auth_leaked_password_protection` ยังเหลือเป็น manual
      dashboard step (ดู `docs/deployment.md` §3)
- [ ] Custom domain + HTTPS (Vercel จัดการ cert อัตโนมัติ) — deferred ตามที่ผู้ใช้เลือก ใช้
      `*.vercel.app` ไปก่อน (ดู `docs/deployment.md` §4)
- [x] Monitoring: Vercel Analytics/Logs + Supabase logs; health check — `@vercel/analytics` +
      `/api/health` เพิ่มแล้วในโค้ด; เปิด toggle "Web Analytics" ใน dashboard เป็น manual step
      ครั้งเดียวหลัง deploy (ดู `docs/deployment.md` §5)
- [ ] Backup/Rollback: เปิด Supabase PITR + ขั้นตอน rollback deployment บน Vercel — PITR
      deferred ตามที่ผู้ใช้เลือก (paid add-on); runbook rollback เขียนไว้แล้ว (ดู
      `docs/deployment.md` §6)
- [ ] Go-live checklist: smoke test ทุก role + ตรวจ performance dashboard — checklist เขียนไว้
      แล้ว (ดู `docs/deployment.md` §7) ยังไม่ได้รันจริงเพราะยังไม่ deploy

---

## 5. Non-Functional Requirements

| Requirement | คำอธิบาย |
|---|---|
| Usability | ใช้งานง่าย เหมาะกับ PM, Team Member และ Management |
| Security | สิทธิ์ตาม Role + Row Level Security; `service_role` เฉพาะฝั่ง Server |
| Performance | Dashboard แสดงผลรวดเร็ว (ใช้ index/materialized view ตามจำเป็น) |
| Audit Trail | เก็บประวัติการแก้ไขข้อมูลใน `activity_logs` |
| Scalability | รองรับหลาย Project และหลายทีม |
| Responsive Design | รองรับ Desktop, Tablet, Mobile browser |
| Maintainability | แยก Component / Module ชัดเจน มี test คุม business logic |
| Exportability | Export รายงาน Excel / PDF / CSV |

---

## 6. Suggested Project Structure

```text
/app
  /login
  /dashboard
  /projects
  /projects/[id]
  /projects/[id]/tasks
  /projects/[id]/members
  /projects/[id]/planned-vs-actual
  /resources
  /resources/[id]
  /reports
  /reports/project-summary
  /reports/resource-workload
  /reports/cost
  /settings
/components        (DashboardCard, ProjectTable, TaskTable, ProgressBar,
                    VarianceBadge, ResourceUtilizationBar, RoleGuard, ...)
/lib               (supabase client, calculations, auth helpers)
/supabase          (migrations, seed)
```

---

## 7. In Scope / Out of Scope (ระยะแรก)

**In Scope:** Login/Logout, Dashboard ภาพรวม, Project/Member/Task/Time Log CRUD, Planned vs Actual,
Man-Day & Cost, Resource Dashboard, Report Export, Role-based menu, RLS, Audit Log, Responsive UI

**Out of Scope (ระยะแรก):** Mobile App Native, AI Forecast, Integration กับ HR/Payroll/MS Project/Jira,
Real-time Chat/Comment, Approval Workflow ซับซ้อน, Data Warehouse/Advanced BI, Multi-company

---

## 8. Deployment & Environment

| Environment | คำอธิบาย |
|---|---|
| Development | ทดสอบบนเครื่อง Developer |
| Preview | Vercel Preview ต่อ PR ก่อนขึ้น Production |
| Production | ใช้งานจริง |

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only — ห้ามเปิดเผยบน browser
```

---

## 9. Executive Summary

ProjectPulse เป็น Web Application ติดตามความคืบหน้า Project และการใช้ Resource ภายในองค์กร พัฒนาด้วย
Next.js + Tailwind CSS + Supabase และ deploy บน Vercel แบ่งเป็นระบบหน้าบ้าน (Login, Dashboard, Project,
Task, Time Log, Report) และหลังบ้าน (Project/Resource/Task/Time Log/Man-Day/Cost, Role/Permission, Audit Log)

ระบบช่วยให้ PM และ Management เห็นจำนวน Project, จำนวนคน, ความคืบหน้า, แผนเวลาเทียบเวลาจริง, Man-Day,
ต้นทุนแรงงาน และ Resource Utilization ทั้งภาพรวมและราย Project เพื่อลดความล่าช้าและควบคุมต้นทุนได้ดีขึ้น
