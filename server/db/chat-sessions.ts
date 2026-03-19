import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatSession } from "@/types";

export async function listSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChatSession[]> {
  const { data } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return (data ?? []) as ChatSession[];
}

export async function createSession(
  supabase: SupabaseClient,
  userId: string,
  title = "New chat",
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, title })
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) return null;
  return data as ChatSession;
}

export async function updateSession(
  supabase: SupabaseClient,
  sessionId: string,
  fields: { title?: string },
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) return null;
  return data as ChatSession;
}

export async function deleteSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  return !error;
}
