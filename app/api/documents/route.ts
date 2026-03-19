import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { listDocuments } from "@/server/db/documents";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const supabase = createSupabaseRouteClient(request);
  const documents = await listDocuments(supabase, user.id);

  return NextResponse.json({ documents });
}
