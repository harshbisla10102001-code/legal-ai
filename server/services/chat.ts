import type { SupabaseClient } from "@supabase/supabase-js";
import * as sessionsDb from "@/server/db/chat-sessions";
import * as messagesDb from "@/server/db/chat-messages";
import type { ChatSession, ChatMessage } from "@/types";

export async function getUserSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChatSession[]> {
  return sessionsDb.listSessions(supabase, userId);
}

export async function startSession(
  supabase: SupabaseClient,
  userId: string,
  title?: string,
): Promise<ChatSession | null> {
  return sessionsDb.createSession(supabase, userId, title);
}

export async function renameSession(
  supabase: SupabaseClient,
  sessionId: string,
  title: string,
): Promise<ChatSession | null> {
  return sessionsDb.updateSession(supabase, sessionId, { title });
}

export async function removeSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  return sessionsDb.deleteSession(supabase, sessionId);
}

export async function getSessionMessages(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<ChatMessage[]> {
  return messagesDb.listMessages(supabase, sessionId);
}

export async function addMessage(
  supabase: SupabaseClient,
  sessionId: string,
  role: "user" | "assistant",
  content: string,
): Promise<ChatMessage | null> {
  const msg = await messagesDb.createMessage(supabase, sessionId, role, content);

  // Touch the session's updated_at so it sorts to the top
  await sessionsDb.updateSession(supabase, sessionId, {});

  return msg;
}
