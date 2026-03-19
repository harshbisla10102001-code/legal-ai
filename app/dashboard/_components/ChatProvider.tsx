"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ChatMessage, ChatSession } from "@/types";
import {
  fetchSessions,
  createSessionApi,
  updateSessionApi,
  deleteSessionApi,
  fetchMessages,
  createMessageApi,
} from "@/lib/hooks/use-api";

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<Record<string, unknown> | null>(null);

  // Load sessions on mount
  useEffect(() => {
    setSessionsLoading(true);
    fetchSessions()
      .then((list) => {
        setSessions(list);
        if (list.length > 0) setActiveSessionId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    fetchMessages(activeSessionId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [activeSessionId]);

  const createSession = useCallback(async (): Promise<string | null> => {
    try {
      const session = await createSessionApi();
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      setInput("");
      setError(null);
      setDebug(null);
      return session.id;
    } catch {
      return null;
    }
  }, []);

  const switchSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setInput("");
    setError(null);
    setDebug(null);
  }, []);

  const deleteSessionHandler = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSessionApi(sessionId);
      } catch {
        return;
      }
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    },
    [activeSessionId],
  );

  const updateSessionTitle = useCallback(
    async (sessionId: string, firstMessage: string) => {
      const title =
        firstMessage.length > 50
          ? firstMessage.slice(0, 50) + "…"
          : firstMessage;
      try {
        await updateSessionApi(sessionId, title);
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title } : s)),
        );
      } catch {
        // Non-critical, swallow
      }
    },
    [],
  );

  const addUserMessage = useCallback(
    async (content: string): Promise<ChatMessage | null> => {
      let sessionId = activeSessionId;

      if (!sessionId) {
        sessionId = await createSession();
        if (!sessionId) return null;
      }

      try {
        const msg = await createMessageApi(sessionId, "user", content);

        setMessages((prev) => {
          if (prev.length === 0) updateSessionTitle(sessionId!, content);
          return [...prev, msg];
        });

        return msg;
      } catch {
        return null;
      }
    },
    [activeSessionId, createSession, updateSessionTitle],
  );

  const addAssistantMessage = useCallback(
    async (content: string) => {
      if (!activeSessionId) return;
      try {
        const msg = await createMessageApi(activeSessionId, "assistant", content);
        setMessages((prev) => [...prev, msg]);
      } catch {
        // Non-critical: message already shown locally; log would go here
      }
    },
    [activeSessionId],
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
    deleteSession: deleteSessionHandler,
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
