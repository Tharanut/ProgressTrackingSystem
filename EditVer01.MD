# EditVer01 — ปรับ Color Tone ทั้งระบบ ProjectPulse

## วัตถุประสงค์

ปรับ Tone สีของ ProgressTrackingSystem (ProjectPulse) ทั้งหมด:

- **Primary:** `indigo` → `sky` (ม่วงน้ำเงิน → ฟ้าสะอาด)
- **Neutral:** `zinc` → `slate` (เทาอมเหลือง → เทาอมน้ำเงิน เข้ากับ sky ดีกว่า)
- **Navbar:** flat white → dark gradient (sky-900 → sky-800)
- **Card/Table:** เพิ่ม `shadow-sm` เพื่อเพิ่มความลึก
- **คงเดิม:** emerald (success), red (danger), amber (warning) ไม่เปลี่ยน

## กฎเหล็ก

- ห้ามแก้ logic, layout, หรือ functionality ใดๆ
- แก้เฉพาะ Tailwind class names และ CSS variables เท่านั้น
- Dark mode (`dark:`) ต้องเปลี่ยนให้ครบทุกจุดเช่นกัน
- ห้ามเพิ่ม/ลบ element HTML ใดๆ

---

## STEP 1 — Global Replace: `indigo` → `sky` (ทุกไฟล์ใน `src/`)

ใช้ find-and-replace กับทุกไฟล์ `.tsx` ใน `src/` ตามลำดับนี้ (ลำดับสำคัญ เพราะบาง string ซ้อนกัน):

| ค้นหา | แทนที่ด้วย | หมายเหตุ |
|---|---|---|
| `indigo-950` | `sky-950` | dark mode badge bg |
| `indigo-700` | `sky-700` | badge text, dark hover border |
| `indigo-600` | `sky-600` | primary buttons, links, brand text |
| `indigo-500` | `sky-500` | button hover, focus ring, progress bar |
| `indigo-400` | `sky-400` | dark mode text/links |
| `indigo-300` | `sky-300` | dark mode badge text, hover border |
| `indigo-100` | `sky-100` | badge bg light mode |

### ไฟล์ที่มี indigo (19 ไฟล์):

**Components (8 ไฟล์):**
1. `src/components/AppNav.tsx` — brand link color
2. `src/components/DashboardCard.tsx` — default tone text
3. `src/components/StatusBadge.tsx` — in_progress badge (project + task)
4. `src/components/ProgressBar.tsx` — mid-range progress bar color
5. `src/components/ProjectTable.tsx` — project name link
6. `src/components/TaskTable.tsx` — task name link
7. `src/components/DateRangeFilter.tsx` — focus border/ring
8. `src/components/forms/shared.tsx` — inputClass focus + submitClass bg

**Pages (11 ไฟล์):**
9. `src/app/page.tsx` — landing page badge + CTA button
10. `src/app/login/page.tsx` — brand link, input focus, login button
11. `src/app/dashboard/page.tsx` — overloaded resource links, delayed project links
12. `src/app/projects/page.tsx` — filter input focus
13. `src/app/projects/[id]/page.tsx` — sub-nav links (Tasks, Members, Planned vs Actual)
14. `src/app/resources/page.tsx` — resource name links
15. `src/app/resources/[id]/page.tsx` — project links in tables
16. `src/app/reports/page.tsx` — report card hover border + title
17. `src/app/reports/cost/page.tsx` — project name links
18. `src/app/reports/project-summary/page.tsx` — project name links
19. `src/app/reports/resource-workload/page.tsx` — (ตรวจสอบว่ามี indigo ด้วย)

---

## STEP 2 — Global Replace: `zinc` → `slate` (ทุกไฟล์ใน `src/`)

ใช้ find-and-replace กับทุกไฟล์ `.tsx` และ `.css` ใน `src/` ตามลำดับนี้:

| ค้นหา | แทนที่ด้วย | หมายเหตุ |
|---|---|---|
| `zinc-950` | `slate-950` | dark mode body bg |
| `zinc-900` | `slate-900` | dark mode card bg, text color |
| `zinc-800` | `slate-800` | dark mode borders, button hover |
| `zinc-700` | `slate-700` | dark mode input border, badge text |
| `zinc-600` | `slate-600` | nav link text, table cell text |
| `zinc-500` | `slate-500` | muted text, table headers |
| `zinc-400` | `slate-400` | dark mode muted text, hints |
| `zinc-300` | `slate-300` | dark mode badge text, input border |
| `zinc-200` | `slate-200` | borders, badge bg |
| `zinc-100` | `slate-100` | row borders, badge bg light |
| `zinc-50` | `slate-50` | body bg light mode |

### ไฟล์ที่มี zinc (35 ไฟล์):

**Config/Layout (1 ไฟล์):**
1. `src/app/layout.tsx`

**Components (14 ไฟล์):**
2. `src/components/AppNav.tsx`
3. `src/components/DashboardCard.tsx`
4. `src/components/StatusBadge.tsx`
5. `src/components/ProgressBar.tsx`
6. `src/components/VarianceBadge.tsx`
7. `src/components/ProjectTable.tsx`
8. `src/components/TaskTable.tsx`
9. `src/components/ResourceUtilizationBar.tsx`
10. `src/components/DateRangeFilter.tsx`
11. `src/components/ExportButton.tsx`
12. `src/components/forms/shared.tsx`
13. `src/components/forms/AddMemberForm.tsx`
14. `src/components/forms/EditProjectForm.tsx`
15. `src/components/forms/EditTaskForm.tsx`
16. `src/components/forms/NewProjectForm.tsx`
17. `src/components/forms/NewTaskForm.tsx`
18. `src/components/forms/NewTimeLogForm.tsx`
19. `src/components/forms/QuickTimeLogForm.tsx`

**Pages (16 ไฟล์):**
20. `src/app/page.tsx`
21. `src/app/login/page.tsx`
22. `src/app/dashboard/page.tsx`
23. `src/app/projects/page.tsx`
24. `src/app/projects/[id]/page.tsx`
25. `src/app/projects/[id]/tasks/page.tsx`
26. `src/app/projects/[id]/tasks/[taskId]/page.tsx`
27. `src/app/projects/[id]/members/page.tsx`
28. `src/app/projects/[id]/planned-vs-actual/page.tsx`
29. `src/app/resources/page.tsx`
30. `src/app/resources/[id]/page.tsx`
31. `src/app/time-logs/page.tsx`
32. `src/app/reports/page.tsx`
33. `src/app/reports/cost/page.tsx`
34. `src/app/reports/project-summary/page.tsx`
35. `src/app/reports/resource-workload/page.tsx`

---

## STEP 3 — globals.css: ปรับ CSS Variables

**ไฟล์:** `src/app/globals.css`

เปลี่ยน `:root` variables:
```css
/* เดิม */
--background: #ffffff;
--foreground: #171717;

/* ใหม่ */
--background: #ffffff;
--foreground: #0f172a;  /* slate-900 */
```

เปลี่ยน dark mode variables:
```css
/* เดิม */
--background: #0a0a0a;
--foreground: #ededed;

/* ใหม่ */
--background: #020617;  /* slate-950 */
--foreground: #f1f5f9;  /* slate-100 */
```

---

## STEP 4 — AppNav: เปลี่ยนเป็น Dark Navbar

**ไฟล์:** `src/components/AppNav.tsx`

เปลี่ยน `<header>` className:
```
เดิม: "border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
ใหม่: "border-b border-sky-900 bg-gradient-to-r from-sky-900 to-sky-800 dark:from-slate-900 dark:to-slate-800"
```

เปลี่ยน Brand link:
```
เดิม: "font-bold text-indigo-600 dark:text-indigo-400"
ใหม่: "font-bold text-white"
```

เปลี่ยน Nav links:
```
เดิม: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
ใหม่: "text-sky-100 hover:text-white dark:text-slate-300 dark:hover:text-white"
```

เปลี่ยน User name span:
```
เดิม: "text-zinc-500"
ใหม่: "text-sky-200"
```

เปลี่ยน Logout button:
```
เดิม: "rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
ใหม่: "rounded-lg border border-sky-600 px-3 py-1.5 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
```

---

## STEP 5 — Card/Table Containers: เพิ่ม shadow

ทุกจุดที่มี pattern:
```
rounded-xl border border-slate-200 bg-white ... dark:border-slate-800 dark:bg-slate-900
```

เพิ่ม `shadow-sm` หลัง `bg-white`:
```
rounded-xl border border-slate-200 bg-white shadow-sm ... dark:border-slate-800 dark:bg-slate-900
```

**หมายเหตุ:** ทำ STEP นี้หลัง STEP 2 (เพราะ zinc จะเปลี่ยนเป็น slate แล้ว)

### จุดที่ต้องเพิ่ม shadow-sm (29 จุด):

**Components:**
- `src/components/DashboardCard.tsx:20`
- `src/components/forms/AddMemberForm.tsx:24`
- `src/components/forms/EditProjectForm.tsx:30`
- `src/components/forms/EditTaskForm.tsx:31`
- `src/components/forms/NewProjectForm.tsx:25`
- `src/components/forms/NewTaskForm.tsx:24`
- `src/components/forms/NewTimeLogForm.tsx:26`
- `src/components/forms/QuickTimeLogForm.tsx:19`

**Pages:**
- `src/app/page.tsx:53`
- `src/app/login/page.tsx:26`
- `src/app/dashboard/page.tsx:165`
- `src/app/dashboard/page.tsx:194`
- `src/app/dashboard/page.tsx:235`
- `src/app/dashboard/page.tsx:279`
- `src/app/projects/page.tsx:105`
- `src/app/projects/[id]/page.tsx:107`
- `src/app/projects/[id]/tasks/page.tsx:74`
- `src/app/projects/[id]/tasks/[taskId]/page.tsx:92`
- `src/app/projects/[id]/members/page.tsx:64`
- `src/app/projects/[id]/planned-vs-actual/page.tsx:65`
- `src/app/resources/page.tsx:72`
- `src/app/resources/[id]/page.tsx:94`
- `src/app/resources/[id]/page.tsx:136`
- `src/app/time-logs/page.tsx:53`
- `src/app/reports/page.tsx:42`
- `src/app/reports/cost/page.tsx:76`
- `src/app/reports/cost/page.tsx:122`
- `src/app/reports/project-summary/page.tsx:110`
- `src/app/reports/resource-workload/page.tsx:76`

---

## STEP 6 — Visual QA

1. เปิด dev server: `npm run dev`
2. ตรวจสอบทุกหน้าตามลำดับ:
   - `/login` — login form, button สีฟ้า, focus ring สีฟ้า
   - `/dashboard` — cards มี shadow, ตัวเลขสีฟ้า, navbar gradient เข้ม
   - `/projects` — filter inputs focus สีฟ้า, table links สีฟ้า
   - `/projects/[id]` — sub-nav links สีฟ้า
   - `/projects/[id]/tasks` — task table
   - `/projects/[id]/members` — member table
   - `/projects/[id]/planned-vs-actual` — variance table
   - `/resources` — resource list
   - `/resources/[id]` — resource detail
   - `/reports` — report cards hover border สีฟ้า
   - `/reports/cost` — cost report
   - `/reports/project-summary` — summary report
   - `/reports/resource-workload` — workload report
   - `/time-logs` — time log table
3. ตรวจ Dark mode (ถ้ามี): สีต้องเปลี่ยนครบ ไม่มี indigo/zinc หลงเหลือ
4. ตรวจ contrast: text บน dark navbar ต้องอ่านง่าย

---

## สรุปการเปลี่ยนแปลง

| หมวด | จำนวนไฟล์ | วิธีแก้ |
|---|---|---|
| indigo → sky | 19 ไฟล์ | Global find-replace |
| zinc → slate | 35 ไฟล์ | Global find-replace |
| globals.css | 1 ไฟล์ | แก้ CSS variables |
| AppNav (Navbar) | 1 ไฟล์ | แก้ manual (dark gradient) |
| เพิ่ม shadow-sm | 29 จุดใน ~20 ไฟล์ | แก้ manual หรือ regex replace |
| **รวม** | **~35 ไฟล์** | |
