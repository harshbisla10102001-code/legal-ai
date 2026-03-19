import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { generateChatResponse, AiConfigError } from "@/server/services/ai";
import type { AiChatRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = (await request.json()) as AiChatRequest;

    if (!body?.messages?.length) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const reply = await generateChatResponse(
      body.messages,
      body.language ?? "en",
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);

    if (error instanceof AiConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (error && typeof error === "object") {
      const status =
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : NaN;
      const message =
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
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
