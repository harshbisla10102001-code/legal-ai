import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "documents";

export async function uploadDocument(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const storagePath = `${userId}/${documentId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return storagePath;
}

export async function downloadDocument(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storagePath);

  if (error || !data) throw new Error(`Storage download failed: ${error?.message}`);
  return data.arrayBuffer();
}
