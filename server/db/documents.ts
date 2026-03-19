import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentRecord, DocumentAnalysis } from "@/types";

export async function createDocument(
  supabase: SupabaseClient,
  doc: Omit<DocumentRecord, "id" | "created_at">,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from("documents")
    .insert(doc)
    .select()
    .single();

  if (error || !data) return null;
  return data as DocumentRecord;
}

export async function updateDocumentAnalysis(
  supabase: SupabaseClient,
  id: string,
  analysis: DocumentAnalysis,
  extractionMethod: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from("documents")
    .update({
      analysis_json: analysis,
      risk_score: analysis.risk_score,
      document_type: analysis.document_type,
      extraction_method: extractionMethod,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return data as DocumentRecord;
}

export async function listDocuments(
  supabase: SupabaseClient,
  userId: string,
): Promise<DocumentRecord[]> {
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as DocumentRecord[];
}

export async function getDocument(
  supabase: SupabaseClient,
  id: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as DocumentRecord;
}
