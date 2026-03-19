import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { getDocument } from "@/server/db/documents";
import { logAction } from "@/server/services/audit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { id } = await ctx.params;
  const supabase = createSupabaseRouteClient(request);
  const document = await getDocument(supabase, id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await logAction(supabase, user.id, "document_view", id);

  return NextResponse.json({ document });
}
