import path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

export function getGroqApiKey(): string | undefined {
  return (
    process.env.GROQ_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim() ||
    undefined
  );
}

export const GROQ_MODEL = "llama-3.1-8b-instant";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, anonKey };
}
