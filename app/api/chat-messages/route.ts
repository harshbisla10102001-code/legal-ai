import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { getSessionMessages, addMessage } from "@/server/services/chat";
import type { CreateMessageRequest } from "@/types";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id query param is required" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseRouteClient(request);
  const messages = await getSessionMessages(supabase, sessionId);

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = (await request.json()) as CreateMessageRequest;

  if (!body.session_id || !body.role || !body.content?.trim()) {
    return NextResponse.json(
      { error: "session_id, role, and content are required" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseRouteClient(request);
  const message = await addMessage(
    supabase,
    body.session_id,
    body.role,
    body.content.trim(),
  );

  if (!message) {
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}
