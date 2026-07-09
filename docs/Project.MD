# Project Scope & Specification

## Project Name Options

| No. | Name | Meaning |
|---|---|---|
| 1 | ProjectPulse | ระบบติดตามชีพจรและความคืบหน้าของ Project |
| 2 | WorkScope | ระบบติดตาม Scope, Task และ Resource |
| 3 | FlowTrack | ระบบติดตามการไหลของงานในแต่ละ Project |
| 4 | ManDay Insight | ระบบวิเคราะห์ Man-Day และต้นทุนของ Project |
| 5 | TaskMeter | ระบบวัดผลงาน ความคืบหน้า และความต่างระหว่างแผนกับงานจริง |

**Recommended Name:** ProjectPulse  
เหมาะสำหรับระบบ Dashboard ที่ใช้ติดตามความคืบหน้าของ Project, Resource, Man-Day และ Cost ในภาพรวม

---

# 1. Project Overview

ระบบนี้เป็น Web Application สำหรับติดตามความคืบหน้าของ Project และการใช้ Resource ภายในองค์กร โดยระบบสามารถบันทึกข้อมูล Project, จำนวนคนที่ทำงานในแต่ละ Project, หน้าที่ของแต่ละคน, Task ที่ได้รับมอบหมาย, ระยะเวลาที่วางแผนไว้, เวลาที่เกิดขึ้นจริง และ Man-Day ที่ใช้จริง

ระบบจะช่วยให้ Project Manager และ Management สามารถเปรียบเทียบ Planned vs Actual เพื่อดูความแตกต่างของเวลา ต้นทุน และการใช้ Resource ทั้งในระดับภาพรวมและราย Project

---

# 2. Objectives

ระบบมีวัตถุประสงค์หลักดังนี้

1. บันทึกจำนวน Project ที่ดำเนินการอยู่
2. บันทึกจำนวนคนที่เข้าร่วมในแต่ละ Project
3. กำหนดหน้าที่และความรับผิดชอบของแต่ละคนใน Project
4. วางแผนระยะเวลาการทำ Task แต่ละรายการ
5. บันทึกเวลาที่เกิดขึ้นจริงในการทำงาน
6. เปรียบเทียบ Planned Time กับ Actual Time
7. คำนวณ Man-Day และต้นทุนแรงงานเบื้องต้น
8. แสดง Dashboard ภาพรวมของ Project ทั้งหมด
9. Drill Down ดูรายละเอียดราย Project, รายคน และราย Task
10. ช่วยวิเคราะห์ Project Delay, Resource Overload และ Cost Over Plan

---

# 3. Technology Stack

| Layer | Technology | Description |
|---|---|---|
| Frontend | Next.js | ใช้พัฒนา Web Application, Dashboard, Form และ Report |
| UI Styling | Tailwind CSS | ใช้ออกแบบหน้าจอให้สวยงาม ใช้งานง่าย และ Responsive |
| Backend Logic | Next.js Server Actions / API Routes | ใช้จัดการ Business Logic, Calculation, Validation และ API |
| Database | Supabase PostgreSQL | ใช้เก็บข้อมูล Project, Task, Resource, Time Log และ Cost |
| Authentication | Supabase Auth | ใช้ Login ด้วย User และ Password, User Authentication และจัดการผู้ใช้งาน |
| Authorization | Supabase Row Level Security | ใช้ควบคุมสิทธิ์การเข้าถึงข้อมูล |
| Hosting | Vercel | ใช้ Deploy ระบบ Next.js |
| Environment Config | Vercel Environment Variables | ใช้เก็บค่า URL, API Key และ Secret ต่าง ๆ |

---

# 4. System Architecture

```text
User / Team Member / Project Manager / Management
        ↓
Frontend: Next.js + Tailwind CSS
        ↓
Backend Logic: Next.js Server Actions / API Routes
        ↓
Supabase Auth + Supabase PostgreSQL
        ↓
Dashboard / Report / Export
        ↓
Deploy on Vercel
```

---

# 5. System Scope

ระบบแบ่งออกเป็น 2 ส่วนหลัก

1. ระบบหน้าบ้าน Frontend
2. ระบบหลังบ้าน Backend

---

# 6. Frontend Scope

## 6.1 Login Page

ใช้สำหรับให้ผู้ใช้งานเข้าสู่ระบบ

### Main Functions

- Login ด้วย User และ Password
- Logout
- ตรวจสอบ Role ของผู้ใช้งาน
- Redirect ไปยังหน้าที่เหมาะสมตามสิทธิ์

### User Roles

| Role | Description |
|---|---|
| Admin | จัดการข้อมูลทั้งหมดในระบบ |
| Project Manager | สร้าง Project, Assign Task และดู Report ของ Project |
| Team Member | ดู Task ของตนเองและอัปเดตความคืบหน้า |
| Management | ดู Dashboard ภาพรวมและรายงาน |
| Viewer | ดูข้อมูลอย่างเดียว |

---

## 6.2 Main Dashboard

เป็นหน้าหลักสำหรับดูภาพรวม Project ทั้งหมด

### Information Displayed

- จำนวน Project ทั้งหมด
- จำนวน Project ที่กำลังดำเนินการ
- จำนวน Project ที่เสร็จแล้ว
- จำนวน Project ที่ล่าช้า
- Total Planned Man-Day
- Total Actual Man-Day
- Man-Day Variance
- Total Planned Cost
- Total Actual Cost
- Cost Variance
- Resource Utilization
- Top 5 Project ที่ล่าช้ามากที่สุด
- Top 5 Resource ที่มี Workload สูงที่สุด

### Example Dashboard Cards

| Card | Example |
|---|---:|
| Total Projects | 25 |
| In Progress | 12 |
| Completed | 8 |
| Delayed | 5 |
| Planned MD | 1,200 |
| Actual MD | 1,430 |
| MD Variance | +230 |
| Cost Variance | +18% |

---

## 6.3 Project List Page

หน้ารายการ Project ทั้งหมด

### Main Functions

- ค้นหา Project
- Filter ตาม Status
- Filter ตาม Project Owner
- Filter ตาม Department
- Filter ตามช่วงเวลา
- แสดง % ความคืบหน้า
- แสดงสถานะ Delay / On Track
- กดเข้าไปดูรายละเอียด Project ได้

### Display Columns

| Column | Description |
|---|---|
| Project Code | รหัส Project |
| Project Name | ชื่อ Project |
| Owner | ผู้รับผิดชอบ |
| Members | จำนวนคนใน Project |
| Progress % | ความคืบหน้า |
| Planned MD | Man-Day ตามแผน |
| Actual MD | Man-Day จริง |
| Variance % | ความต่างระหว่างแผนกับจริง |
| Status | สถานะ Project |

---

## 6.4 Project Detail Page

ใช้ดูรายละเอียดเฉพาะ Project

### Suggested Tabs

| Tab | Description |
|---|---|
| Overview | ภาพรวม Project |
| Team Members | รายชื่อคนใน Project |
| Task List | รายการ Task |
| Timeline | แผนงานตามช่วงเวลา |
| Planned vs Actual | เปรียบเทียบแผนกับจริง |
| Cost | ต้นทุน Man-Day |
| Attachment | เอกสารแนบ |
| Activity Log | ประวัติการแก้ไข |

---

## 6.5 Team Members Page

ใช้ดูว่า Project นี้มีใครบ้าง และแต่ละคนทำหน้าที่อะไร

### Display Fields

| Field | Description |
|---|---|
| Employee Name | ชื่อคนทำงาน |
| Role | หน้าที่ใน Project |
| Responsibility | สิ่งที่รับผิดชอบ |
| Assigned Task | จำนวน Task |
| Planned MD | Man-Day ตามแผน |
| Actual MD | Man-Day จริง |
| Utilization % | การใช้งาน Resource |
| Status | Normal / Overload |

---

## 6.6 Task Management Page

ใช้สร้าง แก้ไข มอบหมาย และติดตาม Task

### Main Functions

- Create Task
- Edit Task
- Assign Task
- Update Progress %
- Update Status
- Add Remark
- Add Attachment
- Close Task

### Task Fields

| Field | Description |
|---|---|
| Task Name | ชื่องาน |
| Project | Project ที่เกี่ยวข้อง |
| Assigned To | ผู้รับผิดชอบ |
| Planned Start Date | วันที่เริ่มตามแผน |
| Planned End Date | วันที่จบตามแผน |
| Actual Start Date | วันที่เริ่มจริง |
| Actual End Date | วันที่จบจริง |
| Planned Hour | ชั่วโมงตามแผน |
| Actual Hour | ชั่วโมงจริง |
| Progress % | ความคืบหน้า |
| Status | Pending / In Progress / Done / Delayed |
| Remark | หมายเหตุ |

---

## 6.7 Time Log / Work Log Page

ใช้ให้คนทำงานบันทึกเวลาทำงานจริง

### Time Log Fields

| Field | Description |
|---|---|
| Work Date | วันที่ทำงาน |
| Project | Project |
| Task | Task |
| Employee | ผู้ทำงาน |
| Work Hour | จำนวนชั่วโมง |
| Work Detail | รายละเอียดที่ทำ |
| Issue / Blocker | ปัญหาที่พบ |
| Submit By | ผู้บันทึก |

ระบบจะนำ Work Hour ไปคำนวณเป็น Actual Man-Day

```text
Actual Man-Day = Actual Work Hour / 8
```

---

## 6.8 Planned vs Actual Page

ใช้เปรียบเทียบแผนกับสิ่งที่เกิดขึ้นจริง

### Example Display

| Item | Planned | Actual | Variance | Variance % |
|---|---:|---:|---:|---:|
| Duration | 10 Days | 13 Days | +3 Days | +30% |
| Man-Day | 20 MD | 25 MD | +5 MD | +25% |
| Cost | 40,000 | 52,000 | +12,000 | +30% |

---

## 6.9 Resource Dashboard

ใช้ดูภาระงานของแต่ละคน

### Information Displayed

- Resource หนึ่งคนอยู่กี่ Project
- รับผิดชอบกี่ Task
- Planned Man-Day รวม
- Actual Man-Day รวม
- Utilization %
- Resource ที่ Overload
- Resource ที่ยังมี Capacity เหลือ

### Example

| Employee | Projects | Tasks | Planned MD | Actual MD | Utilization |
|---|---:|---:|---:|---:|---:|
| A | 3 | 12 | 20 | 26 | 130% |
| B | 2 | 8 | 15 | 12 | 80% |
| C | 4 | 16 | 30 | 35 | 117% |

---

## 6.10 Report / Export Page

ระบบควร Export Report ได้ดังนี้

- Project Summary Report
- Task Progress Report
- Planned vs Actual Report
- Man-Day Report
- Resource Workload Report
- Cost Report

### Export Format

- Excel
- PDF
- CSV

---

# 7. Backend Scope

## 7.1 Authentication & Authorization

ใช้ Supabase Auth สำหรับ Login และจัดการ User Identity โดยระบบหน้าจอ Login จะรับค่า User และ Password

### Backend Responsibilities

- ตรวจสอบ User Login ด้วย User และ Password
- ตรวจสอบ Role และ Permission
- จำกัดสิทธิ์การมองเห็นข้อมูลตาม Role
- ใช้ Row Level Security ใน Supabase เพื่อควบคุมข้อมูล

### Login Requirement

- ผู้ใช้งานเข้าสู่ระบบด้วย User และ Password
- User ต้องไม่ซ้ำกันในระบบ
- ระบบต้อง Mapping User กับ `profiles.id` และ Supabase Auth User ID
- Email สามารถเก็บเป็นข้อมูลติดต่อหรือใช้สำหรับ Notification ได้ แต่ไม่ใช่ข้อมูลหลักที่ผู้ใช้กรอกในหน้า Login

---

## 7.2 Backend Logic

| Logic | Description |
|---|---|
| Project Calculation | คำนวณ Progress, Status และ Delay |
| Man-Day Calculation | คำนวณชั่วโมงเป็น Man-Day |
| Variance Calculation | คำนวณ Planned vs Actual |
| Cost Calculation | คำนวณต้นทุนจาก Man-Day |
| Resource Utilization | คำนวณภาระงานของแต่ละคน |
| Permission Control | ตรวจสอบสิทธิ์ผู้ใช้งาน |
| Audit Log | บันทึกประวัติการเปลี่ยนแปลง |
| Report Query | Query ข้อมูลเพื่อทำ Dashboard |

---

## 7.3 API Scope

| API | Method | Description |
|---|---|---|
| /api/auth/login | POST | Login ด้วย User และ Password |
| /api/projects | GET | ดึงรายการ Project |
| /api/projects | POST | สร้าง Project |
| /api/projects/:id | GET | ดึงรายละเอียด Project |
| /api/projects/:id | PUT | แก้ไข Project |
| /api/tasks | GET | ดึงรายการ Task |
| /api/tasks | POST | สร้าง Task |
| /api/tasks/:id | PUT | แก้ไข Task |
| /api/time-logs | POST | บันทึกเวลาทำงาน |
| /api/dashboard/summary | GET | ดึงข้อมูล Dashboard รวม |
| /api/reports/project-summary | GET | ดึงรายงาน Project Summary |
| /api/reports/resource | GET | ดึงรายงาน Resource |
| /api/reports/cost | GET | ดึงรายงาน Cost |

---

# 8. Database Design

## 8.1 Table: profiles

เก็บข้อมูลผู้ใช้งาน

| Field | Type | Description |
|---|---|---|
| id | uuid | อ้างอิงจาก Supabase Auth |
| employee_code | text | รหัสพนักงาน |
| username | text | User สำหรับ Login |
| full_name | text | ชื่อ-นามสกุล |
| email | text | Email สำหรับติดต่อหรือแจ้งเตือน ไม่ใช้เป็น Login หลัก |
| department_id | uuid | แผนก |
| role | text | admin / pm / member / management / viewer |
| cost_rate_per_day | numeric | ต้นทุนต่อวัน |
| is_active | boolean | สถานะใช้งาน |

---

## 8.2 Table: departments

เก็บข้อมูลแผนก

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| department_code | text | รหัสแผนก |
| department_name | text | ชื่อแผนก |

---

## 8.3 Table: projects

เก็บข้อมูล Project

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| project_code | text | รหัส Project |
| project_name | text | ชื่อ Project |
| project_owner_id | uuid | ผู้รับผิดชอบหลัก |
| department_id | uuid | แผนกเจ้าของ Project |
| planned_start_date | date | วันที่เริ่มตามแผน |
| planned_end_date | date | วันที่จบตามแผน |
| actual_start_date | date | วันที่เริ่มจริง |
| actual_end_date | date | วันที่จบจริง |
| status | text | สถานะ Project |
| priority | text | High / Medium / Low |
| planned_man_day | numeric | Man-Day ตามแผน |
| actual_man_day | numeric | Man-Day จริง |
| planned_cost | numeric | ต้นทุนตามแผน |
| actual_cost | numeric | ต้นทุนจริง |
| progress_percent | numeric | ความคืบหน้า |
| description | text | รายละเอียด Project |
| created_at | timestamp | วันที่สร้าง |

---

## 8.4 Table: project_members

เก็บรายชื่อคนใน Project

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| project_id | uuid | Project ID |
| user_id | uuid | User ID |
| project_role | text | บทบาทใน Project |
| responsibility | text | หน้าที่รับผิดชอบ |
| planned_man_day | numeric | Man-Day ตามแผน |
| actual_man_day | numeric | Man-Day จริง |

---

## 8.5 Table: tasks

เก็บ Task ของแต่ละ Project

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| project_id | uuid | Project ID |
| task_name | text | ชื่อ Task |
| task_description | text | รายละเอียด Task |
| assigned_to | uuid | ผู้รับผิดชอบ |
| planned_start_date | date | วันที่เริ่มตามแผน |
| planned_end_date | date | วันที่จบตามแผน |
| actual_start_date | date | วันที่เริ่มจริง |
| actual_end_date | date | วันที่จบจริง |
| planned_hour | numeric | ชั่วโมงตามแผน |
| actual_hour | numeric | ชั่วโมงจริง |
| planned_man_day | numeric | Man-Day ตามแผน |
| actual_man_day | numeric | Man-Day จริง |
| progress_percent | numeric | ความคืบหน้า |
| status | text | สถานะ Task |
| remark | text | หมายเหตุ |

---

## 8.6 Table: time_logs

เก็บเวลาทำงานจริง

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| project_id | uuid | Project ID |
| task_id | uuid | Task ID |
| user_id | uuid | User ID |
| work_date | date | วันที่ทำงาน |
| work_hour | numeric | ชั่วโมงทำงาน |
| work_detail | text | รายละเอียดงาน |
| issue_blocker | text | ปัญหาหรืออุปสรรค |
| created_at | timestamp | วันที่บันทึก |

---

## 8.7 Table: cost_logs

เก็บต้นทุนที่คำนวณจาก Man-Day

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| project_id | uuid | Project ID |
| task_id | uuid | Task ID |
| user_id | uuid | User ID |
| man_day | numeric | Man-Day |
| cost_rate_per_day | numeric | ต้นทุนต่อวัน |
| total_cost | numeric | ต้นทุนรวม |

---

## 8.8 Table: attachments

เก็บเอกสารแนบของ Project หรือ Task

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| project_id | uuid | Project ID |
| task_id | uuid | Task ID |
| file_name | text | ชื่อไฟล์ |
| file_url | text | URL ไฟล์ |
| uploaded_by | uuid | ผู้ Upload |
| uploaded_at | timestamp | วันที่ Upload |

---

## 8.9 Table: activity_logs

เก็บประวัติการเปลี่ยนแปลงข้อมูล

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary Key |
| entity_type | text | ประเภทข้อมูล เช่น project, task, user |
| entity_id | uuid | ID ของข้อมูล |
| action | text | create / update / delete |
| old_value | jsonb | ค่าเดิม |
| new_value | jsonb | ค่าใหม่ |
| changed_by | uuid | ผู้แก้ไข |
| changed_at | timestamp | วันที่แก้ไข |

---

# 9. Business Rules

## 9.1 Man-Day Calculation

```text
Man-Day = Work Hour / Standard Working Hour Per Day
```

โดยกำหนดมาตรฐานเริ่มต้น

```text
1 Man-Day = 8 Hours
```

---

## 9.2 Actual Man-Day ของ Task

```text
Task Actual Man-Day = Sum(Work Hour ของ Task นั้น) / 8
```

---

## 9.3 Cost Calculation

```text
Actual Cost = Actual Man-Day x Cost Rate Per Day
```

---

## 9.4 Variance Calculation

```text
Variance = Actual - Planned
```

```text
Variance % = (Actual - Planned) / Planned x 100
```

```text
Man-Day Variance = Actual Man-Day - Planned Man-Day
```

```text
Cost Variance = Actual Cost - Planned Cost
```

---

## 9.5 Project Progress Calculation

### Option 1: Based on Completed Task

```text
Project Progress % = Completed Task / Total Task x 100
```

### Option 2: Average Task Progress

```text
Project Progress % = Average(Task Progress %)
```

### Option 3: Weighted Progress by Planned Man-Day

```text
Weighted Progress % = Sum(Task Progress % x Planned Man-Day) / Sum(Planned Man-Day)
```

**Recommended:** ใช้ Option 3 เพราะ Task ที่ใช้เวลามากควรมีผลต่อ Progress มากกว่า Task เล็ก

---

# 10. Suggested Next.js Page Structure

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
```

---

# 11. Suggested Components

| Component | Description |
|---|---|
| DashboardCard | แสดงตัวเลข Summary |
| ProjectStatusBadge | แสดงสถานะ Project |
| ProgressBar | แสดง % ความคืบหน้า |
| ProjectTable | ตาราง Project |
| TaskTable | ตาราง Task |
| VarianceBadge | แสดง Over / Under Plan |
| ResourceUtilizationBar | แสดง Workload |
| DateRangeFilter | Filter วันที่ |
| ExportButton | Export รายงาน |
| RoleGuard | ตรวจสิทธิ์การเข้าถึงหน้า |

---

# 12. Dashboard Design

## 12.1 Overall Dashboard

สำหรับ Management

- Total Project
- Project by Status
- Project by Department
- Planned vs Actual Man-Day
- Planned vs Actual Cost
- Resource Utilization
- Delay Project List
- Overload Resource List

---

## 12.2 Project Dashboard

สำหรับ Project Manager

- Project Progress %
- Task Status
- Team Member Workload
- Planned vs Actual Timeline
- Planned vs Actual Man-Day
- Cost Variance
- Delay Task
- Issue / Blocker

---

## 12.3 Resource Dashboard

สำหรับดูการใช้ Resource

- Resource คนหนึ่งอยู่กี่ Project
- Task ที่รับผิดชอบ
- Planned MD
- Actual MD
- Utilization %
- Capacity เหลือเท่าไร
- Resource ที่ Overload

---

# 13. Functional Requirements

1. ระบบต้องสามารถ Login / Logout ได้
2. ระบบต้องสามารถกำหนด Role ของผู้ใช้งานได้
3. ระบบต้องสามารถสร้าง แก้ไข และดูข้อมูล Project ได้
4. ระบบต้องสามารถเพิ่มรายชื่อคนทำงานใน Project ได้
5. ระบบต้องสามารถกำหนด Role และหน้าที่ของแต่ละคนได้
6. ระบบต้องสามารถสร้าง Task ภายใต้ Project ได้
7. ระบบต้องสามารถ Assign Task ให้ผู้รับผิดชอบได้
8. ระบบต้องสามารถกำหนด Planned Time และ Planned Man-Day ได้
9. ระบบต้องสามารถบันทึก Actual Time และ Actual Man-Day ได้
10. ระบบต้องสามารถอัปเดต Progress % ได้
11. ระบบต้องสามารถเปรียบเทียบ Planned vs Actual ได้
12. ระบบต้องสามารถคำนวณ Man-Day ได้
13. ระบบต้องสามารถคำนวณ Cost จาก Man-Day ได้
14. ระบบต้องสามารถแสดง Dashboard รวมทุก Project ได้
15. ระบบต้องสามารถ Drill Down ดูรายละเอียดราย Project ได้
16. ระบบต้องสามารถแสดง Resource Utilization ได้
17. ระบบต้องสามารถ Export Report เป็น Excel / PDF / CSV ได้
18. ระบบต้องสามารถบันทึก Activity Log ได้

---

# 14. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Usability | ใช้งานง่าย เหมาะกับ PM, Team Member และ Management |
| Security | กำหนดสิทธิ์ตาม Role และใช้ Row Level Security |
| Performance | Dashboard ต้องแสดงผลได้รวดเร็ว |
| Audit Trail | ต้องเก็บประวัติการแก้ไขข้อมูล |
| Scalability | รองรับหลาย Project และหลายทีม |
| Responsive Design | รองรับ Desktop, Tablet และ Mobile Browser |
| Maintainability | Code ต้องแยก Component และ Module ชัดเจน |
| Exportability | รองรับการ Export รายงาน |

---

# 15. In Scope / Out of Scope

## 15.1 Frontend In Scope

- Login / Logout
- Dashboard ภาพรวม
- Project List
- Project Detail
- Project Member
- Task Management
- Time Log
- Planned vs Actual
- Resource Dashboard
- Report Export
- Role-based Menu
- Responsive UI

## 15.2 Frontend Out of Scope ระยะแรก

- Mobile App Native
- AI Forecast
- Integration กับ HR System
- Integration กับ Payroll
- Integration กับ Microsoft Project
- Integration กับ Jira
- Chat / Comment แบบ Real-time
- Approval Workflow ซับซ้อน

## 15.3 Backend In Scope

- Supabase Database
- Supabase Auth
- Role-based Access Control
- Row Level Security
- Project CRUD
- Task CRUD
- Time Log CRUD
- Man-Day Calculation
- Cost Calculation
- Variance Calculation
- Dashboard Query
- Audit Log
- Export Report

## 15.4 Backend Out of Scope ระยะแรก

- Data Warehouse
- Advanced BI
- Full Workflow Engine
- Multi-company Structure
- Complex Permission Matrix
- Integration กับระบบภายนอก

---

# 16. Development Phases

## Phase 1: MVP

เป้าหมายคือให้ระบบใช้งานพื้นฐานได้ก่อน

### Features

- Login
- Project Master
- Resource Master
- Project Member
- Task Management
- Time Log
- Project Progress %
- Planned vs Actual Man-Day
- Basic Dashboard

---

## Phase 2: Management Dashboard

เพิ่มมุมมองสำหรับผู้บริหาร

### Features

- Overall Dashboard
- Project Status Chart
- Resource Utilization
- Cost Summary
- Delay Project
- Overload Resource
- Export Excel

---

## Phase 3: Cost & Variance Analysis

เพิ่มการวิเคราะห์เชิงลึก

### Features

- Planned Cost vs Actual Cost
- Cost by Project
- Cost by Resource
- Task Variance Report
- Variance Reason
- Drill Down Report

---

## Phase 4: Enhancement

เพิ่มความสามารถขั้นสูง

### Features

- Email / Line / Teams Notification
- AI วิเคราะห์ Risk ของ Project Delay
- Forecast Man-Day จนจบ Project
- Integration กับ HR / Timesheet
- Approval Workflow
- Attachment Management

---

# 17. Deployment Design

ระบบจะ Deploy ด้วย Vercel โดยแยก Environment ดังนี้

| Environment | Description |
|---|---|
| Development | ใช้ทดสอบบนเครื่อง Developer |
| Preview | ใช้ทดสอบก่อนขึ้น Production |
| Production | ใช้งานจริง |

## Environment Variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

หมายเหตุ: `SUPABASE_SERVICE_ROLE_KEY` ต้องใช้เฉพาะฝั่ง Server เท่านั้น และห้ามเปิดเผยบน Browser

---

# 18. Executive Summary

ProjectPulse เป็นระบบ Web Application สำหรับติดตามความคืบหน้าของ Project และการใช้ Resource ภายในองค์กร โดยพัฒนาด้วย Next.js, Tailwind CSS, Supabase และ Deploy ผ่าน Vercel

ระบบแบ่งออกเป็น 2 ส่วนหลัก ได้แก่ ระบบหน้าบ้านและระบบหลังบ้าน โดยระบบหน้าบ้านใช้สำหรับ Login, ดู Dashboard, สร้าง Project, Assign Task, บันทึกเวลาทำงานจริง และดูรายงาน ส่วนระบบหลังบ้านใช้สำหรับจัดการข้อมูล Project, Resource, Task, Time Log, Man-Day, Cost, User Role, Permission และ Audit Log

ระบบนี้จะช่วยให้ Project Manager และ Management เห็นจำนวน Project ทั้งหมด จำนวนคนที่ใช้ในแต่ละ Project ความคืบหน้าของงาน แผนเวลาเทียบกับเวลาจริง Man-Day ที่เกิดขึ้นจริง ต้นทุนแรงงาน และ Resource Utilization ทั้งในภาพรวมและราย Project เพื่อสนับสนุนการบริหาร Project ให้มีประสิทธิภาพมากขึ้น ลดความล่าช้า และควบคุมต้นทุนแรงงานได้ดียิ่งขึ้น
