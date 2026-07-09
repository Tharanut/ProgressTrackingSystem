"use server";

import { redirect } from "next/navigation";

import { usernameToEmail } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

/** Login with username + password (username is mapped to a Supabase Auth email). */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "กรุณากรอก Username และ Password" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    return { error: "Username หรือ Password ไม่ถูกต้อง" };
  }

  redirect("/dashboard");
}

/** Sign out and return to the login page. */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
