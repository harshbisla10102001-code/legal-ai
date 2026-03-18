import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import Groq from "groq-sdk";
import path from "path";
import { config } from "dotenv";

function getApiKey(): { key?: string; debug: Record<string, unknown> } {
  const debug: Record<string, unknown> = {
    beforeDotenv: !!process.env.GROQ_API_KEY,
    beforeDotenvLen: process.env.GROQ_API_KEY?.length ?? 0,
    cwd: process.cwd(),
  };

  const envPath = path.join(process.cwd(), ".env.local");
  debug.envPath = envPath;
  const result = config({ path: envPath });
  debug.dotenvResult = result ? { parsed: Object.keys(result.parsed ?? {}) } : null;
  debug.afterDotenv = !!process.env.GROQ_API_KEY;
  debug.afterDotenvLen = process.env.GROQ_API_KEY?.length ?? 0;

  const key =
    process.env.GROQ_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
  debug.finalKey = !!key;
  debug.finalKeyLen = key?.length ?? 0;

  if (key) return { key, debug };
  return { debug };
}

const MODEL = "llama-3.1-8b-instant";

async function getSupabaseUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const { key: apiKey, debug } = getApiKey();
    if (!apiKey) {
      console.log("[GROQ] Key missing. Debug:", JSON.stringify(debug, null, 2));
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com",
          debug,
        },
        { status: 500 },
      );
    }

    const user = await getSupabaseUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      language?: "en" | "hi";
    };

    if (!body?.messages?.length) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const isHindi = body.language === "hi";

    const systemPrompt = isHindi
      ? "आप LegalAI हैं, एक सहायक जो वकीलों को ड्राफ्टिंग और विश्लेषण में मदद करता है। " +
        "आप एक कानूनी फर्म नहीं हैं और आपके उत्तर केवल सूचनात्मक उद्देश्यों के लिए हैं। " +
        "कृपया हमेशा हिंदी में उत्तर दें।"
      : "You are LegalAI, an assistant helping lawyers with drafting and analysis. " +
        "You are not a law firm and your outputs are for informational purposes only.";

    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...body.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const assistantText =
      response.choices[0]?.message?.content ??
      "I couldn't generate a response.";

    return NextResponse.json({ reply: assistantText });
  } catch (error) {
    console.error("AI chat error:", error);
    if (error && typeof error === "object") {
      const status =
        "status" in error && typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : NaN;
      const message =
        "message" in error && typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : undefined;
      if (Number.isFinite(status) && message) {
        return NextResponse.json({ error: message }, { status });
      }
    }
    return NextResponse.json(
      { error: "Something went wrong generating a response" },
      { status: 500 },
    );
  }
}
