"use client";

import { useChat } from "../_components/ChatProvider";

export default function AiChatPage() {
  const {
    messages,
    setMessages,
    appendAssistantMessage,
    input,
    setInput,
    loading,
    setLoading,
    error,
    setError,
    debug,
    setDebug,
  } = useChat();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input.trim(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    setDebug(null);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.debug) setDebug(data.debug);
        throw new Error(data.error || "Request failed");
      }

      const data = (await res.json()) as { reply: string };
      appendAssistantMessage(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">AI Chat</h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Conversations are not legal advice. Review outputs before relying
            on them.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-black/5 bg-white/60 p-3 text-sm dark:border-white/5 dark:bg-black/20">
        {messages.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Start by describing a matter, pasting a clause, or asking for a
            checklist.
          </p>
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
      </div>

      {error ? (
        <div className="mt-3 space-y-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
          <div>{error}</div>
          {debug ? (
            <pre className="mt-2 overflow-auto rounded bg-black/10 p-2 font-mono text-[10px]">
              {JSON.stringify(debug, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSend} className="mt-3 flex items-end gap-2">
        <textarea
          className="min-h-[48px] flex-1 resize-none rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
          placeholder="Ask a question, paste a clause, or describe a task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex h-[40px] items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </form>
    </div>
  );
}
