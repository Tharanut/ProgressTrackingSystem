# คู่มือการใช้งาน ProjectPulse

ระบบติดตามความคืบหน้า Project / Resource / Man-Day / Cost ภายในองค์กร
(ดูรายละเอียดเชิงเทคนิคที่ `CLAUDE.md`, สเปกฉบับเต็มที่ `docs/spec.md`)

---

## 1. บทบาทผู้ใช้งาน (Roles)

| Role | สิทธิ์การใช้งาน |
|---|---|
| **admin** | จัดการข้อมูลทั้งหมด — สร้าง/แก้ไข/ลบ Project, Task, Member, Department, ดู/แก้ profile ทุกคน |
| **pm** (Project Manager) | สร้าง/แก้ไข Project, Task, Member ได้เหมือน admin (ยกเว้นจัดการ Department/Profile) |
| **member** (Team Member) | ดูข้อมูลได้ทุกอย่าง แต่แก้ไขได้แค่ **Task ที่ตัวเองถูก assign** (progress/status/remark) และ **Time Log ของตัวเอง** |
| **management** | ดู Dashboard/Report ภาพรวมได้ทุกอย่าง แต่แก้ไขข้อมูลไม่ได้เลย (read-only) |
| **viewer** | ดูอย่างเดียว เหมือน management |

**บัญชีทดสอบ (seed, dev):**

| Username | Role | Password |
|---|---|---|
| `admin` | admin | `ProjectPulse#2026` |
| `somchai` | pm | `ProjectPulse#2026` |
| `wichai` | member | `ProjectPulse#2026` |
| `nara` | member | `ProjectPulse#2026` |

---

## 2. การเข้าสู่ระบบ

1. เปิดหน้า `/login`
2. กรอก **Username** และ **Password** (ไม่ใช่ email) แล้วกด "เข้าสู่ระบบ"
3. ถ้า username/password ผิด ระบบจะแสดง error โดยไม่บอกว่าผิดที่ field ไหน (เพื่อความปลอดภัย)
4. ล็อกอินสำเร็จจะพาไปหน้า Dashboard อัตโนมัติ
5. กด "ออกจากระบบ" ที่มุมขวาบน (แถบเมนู) เพื่อ Logout

เมนูหลัก (แถบบนของทุกหน้า หลัง login): **Dashboard · Projects · Resources · Reports · Time Logs**
มุมขวาแสดงชื่อผู้ใช้และ Role ปัจจุบัน

---

## 3. Dashboard (`/dashboard`)

หน้าแรกหลัง login แสดงภาพรวมของทุก Project ที่เข้าถึงได้:

- การ์ดสรุป: Total Projects, In Progress, Completed, Delayed
- การ์ดสรุป Man-Day: Planned MD, Actual MD, MD Variance
- การ์ดสรุป Cost: Planned Cost, Actual Cost, Cost Variance (%)
- ตาราง **Project by Department** — จำนวน Project และ MD แยกตามแผนก
- **Top 5 Overloaded Resources** — คนที่ Utilization > 100% (คลิกชื่อเข้าดูรายละเอียดได้)
- **Top 5 Delayed Projects** — Project ที่สถานะ `delayed` หรือเลย planned end date แล้วยังไม่เสร็จ 100% (คลิกเข้าดู Project ได้)
- ตาราง Project ล่าสุด 5 รายการ

---

## 4. จัดการ Project (`/projects`)

### 4.1 ดูรายการ / ค้นหา / กรอง

- ค้นหาได้จาก Project Code หรือ Project Name (ช่อง "ค้นหา Project Code / Name")
- กรองตาม Status ได้ (Planning / In Progress / Completed / Delayed / On Hold / Cancelled)
- ตารางแสดง: Project Code, ชื่อ, Owner, จำนวนสมาชิก, Progress %, Planned/Actual MD, Status

### 4.2 สร้าง Project ใหม่ (admin/pm เท่านั้น)

เลื่อนลงล่างหน้า Projects → กรอกฟอร์ม "สร้าง Project ใหม่": Project Name, Owner, Department,
Planned Start/End Date, Planned Man-Day, Planned Cost, Priority, Description

> **หมายเหตุ:** Project Code ต้องไม่ซ้ำกับที่มีอยู่ ถ้าซ้ำระบบจะแจ้ง error

### 4.3 ดู/แก้ไขรายละเอียด Project (`/projects/[id]`)

- **admin/pm** เห็นฟอร์มแก้ไขทุก field ได้โดยตรง (Owner, Department, วันที่, Status, Priority,
  Planned MD/Cost, Description)
- **member/management/viewer** เห็นเป็นข้อมูล read-only เท่านั้น (Owner, Department, วันที่,
  Priority, Description)
- ด้านบนมีการ์ดสรุป: Progress %, Planned MD, Actual MD, MD Variance + progress bar
- ลิงก์ไปหน้าย่อย: **Tasks →**, **Members →**, **Planned vs Actual →**

---

## 5. จัดการ Task (`/projects/[id]/tasks`)

### 5.1 รายการ Task ของ Project

ตารางแสดง Task ทั้งหมดของ Project นั้น (ชื่อ, ผู้รับผิดชอบ, Progress %, Planned/Actual MD,
กำหนดจบตามแผน, Status) — คลิกชื่อ Task เพื่อเข้าไปดู/แก้ไขรายละเอียด

### 5.2 สร้าง Task ใหม่ (admin/pm เท่านั้น)

กรอกฟอร์มด้านล่างตาราง: Task Name, Description, มอบหมายให้ใคร (Assigned To), Planned
Start/End Date, Planned Hour, Planned Man-Day

### 5.3 หน้ารายละเอียด Task (`/projects/[id]/tasks/[taskId]`)

- **admin/pm** แก้ไขได้ทุก field รวมถึง reassign ผู้รับผิดชอบ, เปลี่ยน Status, ปิด Task
- **member ที่ถูก assign งานนี้** แก้ไขได้เฉพาะ **Progress %, Status, Remark** ของ Task ตัวเอง
  (แก้ไข field อื่น หรือ Task ของคนอื่นไม่ได้)
- ด้านล่างมีฟอร์ม **"บันทึกเวลาทำงาน"** (quick time log) สำหรับ log เวลาทำ Task นี้ทันที พร้อม
  ตารางประวัติ time log ทั้งหมดของ Task (ลบได้เฉพาะรายการของตัวเอง หรือถ้าเป็น admin ลบได้ทุกคน)

---

## 6. จัดการสมาชิก Project (`/projects/[id]/members`)

- ตารางสมาชิก: ชื่อ, Project Role, Responsibility, Planned MD, Actual MD, Utilization %,
  สถานะ **Normal / Overload** (Overload เมื่อ Utilization > 100%)
- **admin/pm** เพิ่มสมาชิกใหม่ได้ (เลือกจากรายชื่อคนที่ยังไม่อยู่ใน Project นี้ + กำหนด
  Project Role, Responsibility, Planned Man-Day) และลบสมาชิกออกได้ (ปุ่มท้ายแถว)
- เพิ่มคนเดิมซ้ำใน Project เดียวกันไม่ได้ (unique constraint)

---

## 7. บันทึกเวลาทำงาน (Time Log)

มี 2 ที่ให้บันทึกเวลาทำงานจริง — ข้อมูลจะรวมกันเป็นชุดเดียวกัน:

1. **`/time-logs`** ("My Time Logs") — เลือก Project และ Task เอง, กรอก Work Date, Work Hour,
   Work Detail, Issue/Blocker แล้วดูรายการล่าสุดของตัวเอง (30 รายการ) พร้อมลบได้
2. **หน้ารายละเอียด Task** — ฟอร์ม "บันทึกเวลาทำงาน" แบบเร็ว (ไม่ต้องเลือก Project/Task เพราะ
   fix ไว้ตาม Task ที่กำลังดูอยู่แล้ว)

ทุกคน (ทุก Role) log เวลาของตัวเองได้ — เห็น/ลบได้แค่ log ของตัวเอง ยกเว้น admin ที่เห็น/ลบได้ทุกคน

**สำคัญ:** ห้ามแก้ Actual Hour / Actual Man-Day / Progress % ของ Project หรือ Task ตรงๆ — ตัวเลข
เหล่านี้ระบบคำนวณอัตโนมัติจาก Time Log ที่บันทึกเข้ามา (ดู §9)

---

## 8. Planned vs Actual (`/projects/[id]/planned-vs-actual`)

เปรียบเทียบ **Duration (วัน) / Man-Day / Cost** ระหว่างแผนกับของจริง พร้อม Variance และ
Variance % (มี badge สีบอกว่า Over/Under Plan) — Actual Duration คำนวณจาก Actual Start Date
ถึง Actual End Date (หรือถึงวันนี้ถ้า Project ยังไม่จบ)

---

## 9. Resource Dashboard (`/resources`)

ภาพรวมภาระงานของทุกคนในองค์กร: จำนวน Resource ทั้งหมด, จำนวนคน Overload (>100%), Utilization
เฉลี่ย, และตารางราย Employee (แผนก, จำนวน Project, จำนวน Task, Planned/Actual MD, Utilization
bar) — คลิกชื่อเพื่อดู **หน้ารายละเอียดรายคน** (`/resources/[id]`) ที่แยกแสดง Project และ Task
ทั้งหมดที่คนนั้นรับผิดชอบ

---

## 10. Reports & Export (`/reports`)

มี 3 รายงานให้เลือก แต่ละหน้ามีปุ่ม **Export Excel / Export PDF / Export CSV**:

| รายงาน | เนื้อหา |
|---|---|
| **Project Summary Report** | Progress, Planned/Actual Man-Day, Cost, Variance ของทุก Project (รวม Planned vs Actual + Man-Day Report) |
| **Resource Workload Report** | Workload และ Utilization ของพนักงานแต่ละคนในทุก Project |
| **Cost Report** | Planned vs Actual Cost แยกตาม Project และตามพนักงาน |

(Task Progress Report ดูได้ที่หน้า Tasks ของแต่ละ Project โดยตรง ไม่ต้องมาหน้า Reports)

> Export ใช้ไฟล์ `.xls`/`.csv`/`.pdf` ที่สร้างฝั่ง browser — เปิดด้วย Excel ได้ตามปกติ

---

## 11. ตัวเลขที่คำนวณอัตโนมัติ (ห้ามแก้มือ)

ค่าต่อไปนี้ระบบคำนวณให้เองทุกครั้งที่มีการบันทึก Time Log หรือแก้ Progress %:

- **Actual Man-Day ของ Task** = รวมชั่วโมงจาก Time Log ของ Task นั้น ÷ 8
- **Actual Man-Day ของ Project** = รวม Actual Man-Day ของทุก Task ในนั้น
- **Progress % ของ Project** = ค่าเฉลี่ยแบบถ่วงน้ำหนักตาม Planned Man-Day ของ Task (Task ที่ใช้
  เวลามากมีผลต่อ Progress ของ Project มากกว่า Task เล็ก)
- **Actual Man-Day ของสมาชิกในทีม** (`project_members.actual_man_day`) = รวมชั่วโมงจาก Time Log
  ของคนนั้นใน Project นั้น ÷ 8
- **Actual Cost** = Actual Man-Day × อัตราต้นทุนต่อวันของพนักงาน ณ **วันที่บันทึก Time Log
  ครั้งแรก** (ถ้าแก้อัตราต้นทุนของพนักงานทีหลัง จะไม่กระทบ Cost ที่บันทึกไปแล้ว)

ถ้าต้องการให้ตัวเลขเหล่านี้เปลี่ยน ต้อง**บันทึก/แก้ไข/ลบ Time Log** หรือ**แก้ Progress % ของ
Task** เท่านั้น — ระบบจะคำนวณตัวเลขที่เหลือให้เองทั้งหมด

---

## 12. ข้อควรรู้เรื่องสิทธิ์การเข้าถึง

- ทุกคนที่ login แล้วมองเห็นข้อมูลได้เกือบทั้งหมด (Project/Task/Time Log/Member) — ระบบจำกัดที่
  "แก้ไขได้แค่ไหน" มากกว่า "มองเห็นอะไรได้แค่ไหน"
- ถ้ากดบันทึก/ลบ แล้ว**หน้าเว็บไม่ error แต่ข้อมูลก็ไม่เปลี่ยน** ให้สงสัยว่าไม่มีสิทธิ์ทำ
  รายการนั้น (เช่น member พยายามลบสมาชิกโครงการ หรือแก้ไข Task ของคนอื่น) — ไม่ใช่บั๊ก เป็น
  พฤติกรรมของระบบสิทธิ์ (Row Level Security)
- Activity Log (ประวัติการแก้ไข) เป็น audit trail ที่**ลบไม่ได้แม้จะเป็น admin** — บันทึกไว้ตลอด
  เพื่อความโปร่งใส

---

## 13. Health Check (สำหรับผู้ดูแลระบบ)

`GET /api/health` — เช็คว่าเว็บแอปเชื่อมต่อฐานข้อมูลได้ปกติหรือไม่ ตอบ `{"status":"ok"}` (200)
ถ้าปกติ หรือ `{"status":"error"}` (503) ถ้ามีปัญหา ใช้สำหรับตั้ง uptime monitor หลัง deploy จริง
(รายละเอียดการ deploy อยู่ที่ `docs/deployment.md`)
