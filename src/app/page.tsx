import Link from "next/link";

const FEATURES = [
  {
    title: "ติดตามความคืบหน้า",
    desc: "ดู Progress ราย Project, ราย Task และราย Resource แบบ Drill Down",
  },
  {
    title: "Planned vs Actual",
    desc: "เปรียบเทียบเวลา, Man-Day และ Cost ที่วางแผนกับที่เกิดขึ้นจริง",
  },
  {
    title: "Dashboard & Reports",
    desc: "ภาพรวมสำหรับผู้บริหาร พร้อม Export Excel / PDF / CSV",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-3xl text-center">
        <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          ProjectPulse
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          ติดตามความคืบหน้าของ Project
          <br />
          และการใช้ Resource ในที่เดียว
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          บันทึก Project, Task, Time Log และเปรียบเทียบ Planned vs Actual เพื่อควบคุม Man-Day
          และต้นทุนแรงงานได้อย่างแม่นยำ
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-500"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
          >
            ไปที่ Dashboard
          </Link>
        </div>

        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
