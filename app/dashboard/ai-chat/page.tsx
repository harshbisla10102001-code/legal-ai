"use client";

import { useRef, useEffect } from "react";
import { useChat } from "../_components/ChatProvider";
import { useLanguage } from "@/lib/i18n";

export default function AiChatPage() {
  const {
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
  } = useChat();

  const { locale, t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    setDebug(null);

    const userMsg = await addUserMessage(content);
    if (!userMsg) {
      setError(t("chat.failed"));
      setLoading(false);
      return;
    }

    const allMessages = [...messages, userMsg];

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language: locale,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.debug) setDebug(data.debug);
        throw new Error(data.error || "Request failed");
      }

      const data = (await res.json()) as { reply: string };
      await addAssistantMessage(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("chat.error_fallback"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-3">
      {/* Session sidebar */}
      <div className="hidden w-56 flex-col rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 md:flex">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("chat.sessions")}
          </h2>
          <button
            onClick={() => createSession()}
            title={t("chat.new_chat")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            +
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {sessionsLoading ? (
            <p className="px-2 py-4 text-center text-xs text-zinc-400">
              {t("chat.loading")}
            </p>
          ) : sessions.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-zinc-400">
              {t("chat.no_conversations")}
            </p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                  s.id === activeSessionId
                    ? "bg-black/10 font-medium dark:bg-white/10"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                onClick={() => switchSession(s.id)}
              >
                <span className="flex-1 truncate">{s.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  title="Delete"
                  className="hidden h-5 w-5 flex-shrink-0 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500 group-hover:flex"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight">
              {t("chat.title")}
            </h1>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {t("chat.disclaimer")}
            </p>
          </div>
          {/* Mobile new-chat button */}
          <button
            onClick={() => createSession()}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-black/10 px-3 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10 md:hidden"
          >
            <span className="text-base leading-none">+</span> {t("chat.new")}
          </button>
        </div>

        {/* Mobile session selector */}
        <div className="mb-3 md:hidden">
          <select
            value={activeSessionId ?? ""}
            onChange={(e) => {
              if (e.target.value) switchSession(e.target.value);
            }}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-xs outline-none dark:border-white/10"
          >
            {sessions.length === 0 && (
              <option value="">{t("chat.no_conversations")}</option>
            )}
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-black/5 bg-white/60 p-3 text-sm dark:border-white/5 dark:bg-black/20"
        >
          {!activeSessionId ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
              <p className="text-sm">{t("chat.start_new")}</p>
              <button
                onClick={() => createSession()}
                className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
              >
                {t("chat.new_chat")}
              </button>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-zinc-500">{t("chat.empty_hint")}</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    m.role === "user"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-xs leading-relaxed">
                    {m.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-100 px-3 py-2 dark:bg-zinc-900">
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 space-y-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            <div>{error}</div>
            {debug && (
              <pre className="mt-2 overflow-auto rounded bg-black/10 p-2 font-mono text-[10px]">
                {JSON.stringify(debug, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="mt-3 flex items-end gap-2">
          <textarea
            className="min-h-[48px] flex-1 resize-none rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
            placeholder={
              activeSessionId
                ? t("chat.placeholder")
                : t("chat.placeholder_disabled")
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            rows={2}
            disabled={!activeSessionId}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !activeSessionId}
            className="inline-flex h-[40px] items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading ? t("chat.thinking") : t("chat.send")}
          </button>
        </form>
      </div>
    </div>
  );
}
