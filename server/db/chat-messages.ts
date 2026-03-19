import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/types";

export async function listMessages(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select("id, role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return (data ?? []) as ChatMessage[];
}

export async function createMessage(
  supabase: SupabaseClient,
  sessionId: string,
  role: "user" | "assistant",
  content: string,
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role, content })
    .select("id, role, content")
    .single();

  if (error || !data) return null;
  return data as ChatMessage;
}
