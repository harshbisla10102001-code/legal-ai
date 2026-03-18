"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ChatContextValue = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  sessionsLoading: boolean;
  error: string | null;
  debug: Record<string, unknown> | null;

  setInput: (v: string) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setDebug: (v: Record<string, unknown> | null) => void;

  createSession: () => Promise<string | null>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  addUserMessage: (content: string) => Promise<ChatMessage | null>;
  addAssistantMessage: (content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const supabase = useRef(createSupabaseBrowserClient()).current;

  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    setSessionsLoading(true);
    supabase
      .from("chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as ChatSession[];
        setSessions(list);
        if (list.length > 0 && !activeSessionId) {
          setActiveSessionId(list[0].id);
        }
        setSessionsLoading(false);
      });
    // Only run on userId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as ChatMessage[]);
      });
  }, [activeSessionId, supabase]);

  const createSession = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;
    const { data, error: err } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, title: "New chat" })
      .select("id, title, created_at, updated_at")
      .single();
    if (err || !data) return null;
    const session = data as ChatSession;
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setMessages([]);
    setInput("");
    setError(null);
    setDebug(null);
    return session.id;
  }, [userId, supabase]);

  const switchSession = useCallback(
    async (sessionId: string) => {
      setActiveSessionId(sessionId);
      setInput("");
      setError(null);
      setDebug(null);
    },
    [],
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await supabase.from("chat_sessions").delete().eq("id", sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setSessions((prev) => {
          const remaining = prev.filter((s) => s.id !== sessionId);
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
          return remaining;
        });
      }
    },
    [supabase, activeSessionId],
  );

  const updateSessionTitle = useCallback(
    async (sessionId: string, firstMessage: string) => {
      const title =
        firstMessage.length > 50
          ? firstMessage.slice(0, 50) + "…"
          : firstMessage;
      await supabase
        .from("chat_sessions")
        .update({ title })
        .eq("id", sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title } : s)),
      );
    },
    [supabase],
  );

  const addUserMessage = useCallback(
    async (content: string): Promise<ChatMessage | null> => {
      let sessionId = activeSessionId;

      if (!sessionId) {
        sessionId = await createSession();
        if (!sessionId) return null;
      }

      const id = randomId();
      const msg: ChatMessage = { id, role: "user", content };

      setMessages((prev) => {
        const isFirst = prev.length === 0;
        if (isFirst) updateSessionTitle(sessionId!, content);
        return [...prev, msg];
      });

      await supabase
        .from("chat_messages")
        .insert({ id, session_id: sessionId, role: "user", content });

      await supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      return msg;
    },
    [activeSessionId, createSession, supabase, updateSessionTitle],
  );

  const addAssistantMessage = useCallback(
    async (content: string) => {
      if (!activeSessionId) return;
      const id = randomId();
      const msg: ChatMessage = { id, role: "assistant", content };
      setMessages((prev) => [...prev, msg]);

      await supabase
        .from("chat_messages")
        .insert({
          id,
          session_id: activeSessionId,
          role: "assistant",
          content,
        });
    },
    [activeSessionId, supabase],
  );

  const value: ChatContextValue = {
    sessions,
    activeSessionId,
    messages,
    input,
    loading,
    sessionsLoading,
    error,
    debug,

    setInput,
    setLoading,
    setError,
    setDebug,

    createSession,
    switchSession,
    deleteSession,
    addUserMessage,
    addAssistantMessage,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
