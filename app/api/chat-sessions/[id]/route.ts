import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { renameSession, removeSession } from "@/server/services/chat";
import type { UpdateSessionRequest } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const body = (await request.json()) as UpdateSessionRequest;

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const supabase = createSupabaseRouteClient(request);
  const session = await renameSession(supabase, id, body.title.trim());

  if (!session) {
    return NextResponse.json(
      { error: "Session not found or update failed" },
      { status: 404 },
    );
  }

  return NextResponse.json({ session });
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const supabase = createSupabaseRouteClient(request);
  const ok = await removeSession(supabase, id);

  if (!ok) {
    return NextResponse.json(
      { error: "Session not found or delete failed" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
