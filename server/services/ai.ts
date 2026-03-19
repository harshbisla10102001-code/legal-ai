import Groq from "groq-sdk";
import { getGroqApiKey, GROQ_MODEL } from "@/server/config";
import type { Locale } from "@/lib/i18n";

const SYSTEM_PROMPTS: Record<Locale, string> = {
  en:
    "You are LegalAI, an assistant helping lawyers with drafting and analysis. " +
    "You are not a law firm and your outputs are for informational purposes only.",
  hi:
    "आप LegalAI हैं, एक सहायक जो वकीलों को ड्राफ्टिंग और विश्लेषण में मदद करता है। " +
    "आप एक कानूनी फर्म नहीं हैं और आपके उत्तर केवल सूचनात्मक उद्देश्यों के लिए हैं। " +
    "कृपया हमेशा हिंदी में उत्तर दें।",
};

export type AiMessage = { role: "user" | "assistant"; content: string };

/**
 * Generate a chat completion using Groq.
 * Throws if the API key is missing or the request fails.
 */
export async function generateChatResponse(
  messages: AiMessage[],
  language: Locale = "en",
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new AiConfigError(
      "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com",
    );
  }

  const groq = new Groq({ apiKey });

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 512,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS[language] },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  return (
    response.choices[0]?.message?.content ??
    "I couldn't generate a response."
  );
}

export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}
