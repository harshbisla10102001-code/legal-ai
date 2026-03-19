import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "document_upload"
  | "document_view"
  | "document_export"
  | "document_process";

export async function logAction(
  supabase: SupabaseClient,
  userId: string,
  action: AuditAction,
  documentId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from("audit_log").insert({
    user_id: userId,
    action,
    document_id: documentId ?? null,
    metadata: metadata ?? null,
  });
}
