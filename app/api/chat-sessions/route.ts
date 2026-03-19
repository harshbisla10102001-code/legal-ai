import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { getUserSessions, startSession } from "@/server/services/chat";
import type { CreateSessionRequest } from "@/types";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = createSupabaseRouteClient(request);
  const sessions = await getUserSessions(supabase, user.id);

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const body = (await request.json().catch(() => ({}))) as CreateSessionRequest;

  const supabase = createSupabaseRouteClient(request);
  const session = await startSession(supabase, user.id, body.title);

  if (!session) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ session }, { status: 201 });
}
