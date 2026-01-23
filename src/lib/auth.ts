import { supabase } from "./supabaseClient";

export type ProfileRole = "admin" | "editor" | "viewer";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * UI guard: cek role dari table profiles.
 * Catatan: ini hanya untuk UX (sembunyikan menu admin). Security tetap via RLS.
 */
export async function getMyRole(): Promise<ProfileRole | null> {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data?.role as ProfileRole) ?? null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getMyRole()) === "admin";
}
