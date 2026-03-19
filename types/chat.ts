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

// ----- API request / response shapes -----

export type AiChatRequest = {
  messages: { role: "user" | "assistant"; content: string }[];
  language?: "en" | "hi";
};

export type AiChatResponse = {
  reply: string;
};

export type ListSessionsResponse = {
  sessions: ChatSession[];
};

export type CreateSessionRequest = {
  title?: string;
};

export type CreateSessionResponse = {
  session: ChatSession;
};

export type UpdateSessionRequest = {
  title: string;
};

export type ListMessagesResponse = {
  messages: ChatMessage[];
};

export type CreateMessageRequest = {
  session_id: string;
  role: "user" | "assistant";
  content: string;
};

export type CreateMessageResponse = {
  message: ChatMessage;
};

export type ApiError = {
  error: string;
  debug?: Record<string, unknown>;
};
