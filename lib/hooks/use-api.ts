import type {
  ChatSession,
  ChatMessage,
  ListSessionsResponse,
  CreateSessionResponse,
  ListMessagesResponse,
  CreateMessageResponse,
  AiChatResponse,
  AiChatRequest,
  ApiError,
  DocumentRecord,
  DocumentAnalysis,
} from "@/types";

async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as ApiError));
    throw new ApiRequestError(
      (body as ApiError).error ?? `Request failed (${res.status})`,
      res.status,
      (body as ApiError).debug,
    );
  }

  return res.json() as Promise<T>;
}

export class ApiRequestError extends Error {
  status: number;
  debug?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    debug?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.debug = debug;
  }
}

// ----- Chat Sessions -----

export async function fetchSessions(): Promise<ChatSession[]> {
  const data = await apiFetch<ListSessionsResponse>("/api/chat-sessions");
  return data.sessions;
}

export async function createSessionApi(
  title?: string,
): Promise<ChatSession> {
  const data = await apiFetch<CreateSessionResponse>("/api/chat-sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return data.session;
}

export async function updateSessionApi(
  id: string,
  title: string,
): Promise<void> {
  await apiFetch(`/api/chat-sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteSessionApi(id: string): Promise<void> {
  await apiFetch(`/api/chat-sessions/${id}`, { method: "DELETE" });
}

// ----- Chat Messages -----

export async function fetchMessages(
  sessionId: string,
): Promise<ChatMessage[]> {
  const data = await apiFetch<ListMessagesResponse>(
    `/api/chat-messages?session_id=${encodeURIComponent(sessionId)}`,
  );
  return data.messages;
}

export async function createMessageApi(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
): Promise<ChatMessage> {
  const data = await apiFetch<CreateMessageResponse>("/api/chat-messages", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, role, content }),
  });
  return data.message;
}

// ----- Documents -----

export async function uploadDocumentApi(
  file: File,
): Promise<{ documentId: string; fileName: string; fileType: string; fileSize: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as ApiError));
    throw new ApiRequestError(
      (body as ApiError).error ?? "Upload failed",
      res.status,
    );
  }

  return res.json();
}

export async function fetchDocumentsApi(): Promise<DocumentRecord[]> {
  const data = await apiFetch<{ documents: DocumentRecord[] }>("/api/documents");
  return data.documents;
}

export async function fetchDocumentApi(id: string): Promise<DocumentRecord> {
  const data = await apiFetch<{ document: DocumentRecord }>(`/api/documents/${id}`);
  return data.document;
}

export type ProcessProgress = {
  step: number;
  message: string;
  done?: boolean;
  document?: DocumentRecord;
  analysis?: DocumentAnalysis;
  error?: string;
};

export async function processDocumentApi(
  id: string,
  onProgress?: (p: ProcessProgress) => void,
): Promise<{ document: DocumentRecord; analysis: DocumentAnalysis }> {
  const res = await fetch(`/api/documents/${id}/process`, {
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) throw new ApiRequestError(data.error ?? "Failed", res.status);
    if (data.done && data.document && data.analysis) {
      return { document: data.document, analysis: data.analysis };
    }
    throw new ApiRequestError("Invalid response", res.status);
  }

  if (!contentType.includes("text/event-stream")) {
    throw new ApiRequestError("Unexpected response type", res.status);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new ApiRequestError("No response body", res.status);

  const decoder = new TextDecoder();
  let buffer = "";

  return new Promise((resolve, reject) => {
    const read = async () => {
      const { done, value } = await reader.read();
      if (done) {
        reject(new ApiRequestError("Stream ended without result", 500));
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6)) as ProcessProgress & {
              document?: DocumentRecord;
              analysis?: DocumentAnalysis;
            };
            onProgress?.(data);
            if (data.done && data.document && data.analysis) {
              resolve({ document: data.document, analysis: data.analysis });
              return;
            }
            if (data.error) {
              reject(new ApiRequestError(data.error, 500));
              return;
            }
          } catch {
            // skip malformed
          }
        }
      }
      read();
    };
    read();
  });
}

export function getDocumentExportUrl(id: string): string {
  return `/api/documents/${id}/export`;
}

// ----- AI Chat -----

export async function sendAiChat(
  messages: AiChatRequest["messages"],
  language: "en" | "hi" = "en",
): Promise<string> {
  const data = await apiFetch<AiChatResponse>("/api/ai-chat", {
    method: "POST",
    body: JSON.stringify({ messages, language }),
  });
  return data.reply;
}
