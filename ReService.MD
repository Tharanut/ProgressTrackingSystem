# ReService.MD — คู่มือเปิด/ปิด Service ทั้งหมดของ ProjectPulse

อ้างอิงจาก `CLAUDE.md`, `docs/deployment.md`, `package.json`, `.mcp.json`, `.claude/settings.json`

---

## 1. Next.js Dev Server (หลัก — ใช้บ่อยสุด)

รันแอปแบบ local สำหรับพัฒนา ที่ `http://localhost:3000` (มี Turbopack เป็น default บน Next.js 16)

**เปิด**

```bash
npm run dev
```

- อ่าน env จาก `.env.local`
- ถ้าพอร์ต 3000 ถูกใช้อยู่แล้ว Next.js จะขยับไปพอร์ตถัดไปอัตโนมัติ (เช่น 3001) — ดู log บรรทัด `Local:` เพื่อดูพอร์ตจริง

**ปิด**

- เทอร์มินัลที่รันอยู่: กด `Ctrl + C`
- ถ้ารันเป็น background process (เช่นผ่าน Claude Code): สั่งหยุด task/process นั้น
- ถ้าพอร์ตค้าง (process เก่าไม่ยอมปิด) บน Windows:

```powershell
# หา PID ที่จับพอร์ต 3000
netstat -ano | findstr :3000
# ปิด process ด้วย PID ที่เจอ
taskkill /PID <pid> /F
```

---

## 2. Production Build + Start (จำลอง production local)

ใช้ตอนอยากทดสอบ build จริงก่อน deploy (ต่างจาก dev server ตรงที่ไม่มี hot-reload, optimize แล้ว)

**เปิด**

```bash
npm run build      # build ก่อนเสมอ
npm run start      # แล้วค่อย start (default port 3000)
```

**ปิด**

- `Ctrl + C` ในเทอร์มินัลที่รัน `npm run start`
- หรือ `taskkill` ตามวิธีในข้อ 1 ถ้าพอร์ตค้าง

> ต่างจาก `next dev`: `next start` ไม่ watch ไฟล์ ต้อง `build` ใหม่ทุกครั้งที่แก้โค้ด

---

## 3. Supabase (Database + Auth + RLS)

Supabase เป็น **hosted service** (project ref `khizdvwjvwtrzyupqgpl`) — **ไม่มีขั้นตอน "เปิด/ปิด" แบบ local** เพราะรันอยู่บน cloud ตลอดเวลา ไม่ได้รันผ่านเครื่องนี้

**เช็คสถานะ**

```bash
# ยิง health check ที่ทำ round-trip ไป Supabase จริง
curl http://localhost:3000/api/health
# {"status":"ok"} = เชื่อมต่อได้ / {"status":"error"} = มีปัญหา
```

- หรือใช้ Supabase MCP tool `get_logs` / `list_tables` เพื่อดูสถานะ/log
- Dashboard: https://supabase.com/dashboard/project/khizdvwjvwtrzyupqgpl

**ถ้าต้องการ "ปิด" การเชื่อมต่อจริง ๆ** มีแค่ 2 ทาง (ระวัง — กระทบทุกคนที่ใช้ระบบ ต้องขออนุญาตก่อนเสมอ):

- Pause project ทั้งโปรเจกต์ผ่าน Supabase Dashboard → Settings → General → Pause project
- หรือหมุน (rotate) service role / anon key เพื่อตัดการเชื่อมต่อจาก app

---

## 4. Test Suites

ไม่ใช่ "service" ระยะยาว แต่รันแล้วจบ (short-lived process)

**Unit tests** (offline, เร็ว, ไม่แตะ Supabase จริง — รันอัตโนมัติผ่าน hook ทุกครั้งที่แก้ `src/**/*.ts(x)` อยู่แล้ว)

```bash
npm run test:unit
```

**Integration tests** (ยิงไป dev Supabase จริงด้วย seeded users — **รัน manual เท่านั้น ห้ามใส่ใน automation**)

```bash
npm run test:integration
```

**Watch mode** (เปิดค้างไว้ระหว่างพัฒนา, ปิดด้วย `Ctrl + C`)

```bash
npm run test:watch
```

**Vitest UI** (มี `@vitest/ui` ติดตั้งไว้แล้วแต่ยังไม่มี script — เรียกตรง ๆ ได้):

```bash
npx vitest --ui
```

ปิดด้วย `Ctrl + C` เช่นกัน (เปิด browser tab ที่ `http://localhost:51204/__vitest__/` ค้างไว้จนกว่าจะปิด process)

---

## 5. Lint / Format (one-shot, ไม่ใช่ service)

```bash
npm run lint            # ESLint ตรวจทั้งโปรเจกต์
npm run format          # Prettier เขียนทับไฟล์
npm run format:check    # Prettier ตรวจอย่างเดียว ไม่แก้ไฟล์
```

---

## 6. Vercel (Deploy target)

**หมายเหตุ: โปรเจกต์นี้ยังไม่ได้ `vercel link`** (ไม่มีโฟลเดอร์ `.vercel/`) — ต้องรันครั้งแรกก่อนใช้คำสั่งด้านล่าง

**Setup ครั้งแรก**

```bash
vercel link                # ผูก repo กับ Vercel project (ทำครั้งเดียว)
vercel env pull .env.local # ดึง env vars จาก Vercel ลง local
```

**Deploy ("เปิด" service เวอร์ชันใหม่)**

- ปกติแค่ `git push` ไป `main` → auto-deploy ขึ้น Production
- push ไป branch อื่น / เปิด PR → auto-deploy เป็น Preview
- Deploy มือ (ไม่ผ่าน git):

```bash
vercel --prod
```

**Rollback ("ปิด" เวอร์ชันปัจจุบัน กลับไปเวอร์ชันก่อนหน้า)**

```bash
vercel rollback                 # เลือกจาก list แบบ interactive
vercel rollback <deployment-url>  # ระบุ deployment ตรง ๆ
```

> ⚠️ Deploy/Rollback กระทบ production จริง — ควรแจ้ง/ขอ confirm ก่อนสั่งทุกครั้ง ไม่ auto-run

---

## 7. MCP Servers (`supabase`, `github`)

เป็น service ที่ Claude Code เชื่อมต่อผ่าน `.mcp.json` (ไฟล์ committed แชร์ร่วมทีม) — ไม่ใช่ process ที่รันบนเครื่อง user แต่เป็น remote HTTP connection

**เปิด/ปิดการเชื่อมต่อ (ต่อ session/ต่อคน)**

- Toggle เปิด/ปิดรายเซิร์ฟเวอร์ผ่าน Claude Code: `/mcp` แล้วเลือกเปิด-ปิด
- การตั้งค่าส่วนตัว (เช่นปิดบาง server เฉพาะเครื่องตัวเอง) เก็บใน `.claude/settings.local.json` (gitignored — ไม่กระทบคนอื่น)

**Requirement ก่อนใช้ `github` MCP**

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=<your-token>
```

(ทำใน shell ของตัวเอง — token ไม่ถูก commit)

---

## 8. Claude Code Hooks (on-edit automation)

`.claude/hooks/on-edit.mjs` ทำงานอัตโนมัติทุกครั้งที่ Write/Edit ไฟล์ `src/**/*.ts(x)` — รัน `eslint --fix` + `prettier --write` + `npm run test:unit` ให้เอง

ไม่มีคำว่า "เปิด/ปิด" แบบ process แต่ถ้าต้องการ **ปิดชั่วคราว** (เช่นตอน debug):

- ปิดทั้งหมด: comment/ลบ block `PostToolUse` ใน `.claude/settings.json` ชั่วคราว (แต่ไฟล์นี้ share ทั้งทีมผ่าน git — แก้แล้วอย่าลืม revert หรือใช้ `.claude/settings.local.json` override แทนถ้าต้องการปิดแค่เครื่องตัวเอง)

---

## สรุปคำสั่งเปิด/ปิดที่ใช้บ่อยที่สุด

| Service | เปิด | ปิด |
|---|---|---|
| Dev server | `npm run dev` | `Ctrl+C` หรือ `taskkill /PID <pid> /F` |
| Production local | `npm run build && npm run start` | `Ctrl+C` |
| Supabase | (hosted, ไม่ต้องเปิด) เช็คด้วย `curl localhost:3000/api/health` | Pause project ใน Dashboard (ระวัง — กระทบทุกคน) |
| Test watch | `npm run test:watch` | `Ctrl+C` |
| Vitest UI | `npx vitest --ui` | `Ctrl+C` |
| Vercel deploy | `git push` main หรือ `vercel --prod` | `vercel rollback` |
| MCP servers | `/mcp` ใน Claude Code | `/mcp` ใน Claude Code |
