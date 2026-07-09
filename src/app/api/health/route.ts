import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").select("id", { head: true, count: "exact" });

  if (error) {
    return Response.json({ status: "error" }, { status: 503 });
  }

  return Response.json({ status: "ok" });
}
