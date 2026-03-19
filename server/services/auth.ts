import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Authenticate the incoming API request via Supabase session cookie.
 * Returns the User object or null.
 */
export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<User | null> {
  const supabase = createSupabaseRouteClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Standard 401 response for unauthorized requests. */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
