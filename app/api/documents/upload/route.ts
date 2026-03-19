import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { uploadDocument } from "@/server/services/storage";
import * as documentsDb from "@/server/db/documents";
import { logAction } from "@/server/services/audit";
import type { DocumentFileType } from "@/types";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: DocumentFileType[] = [
  "pdf",
  "docx",
  "doc",
  "png",
  "jpg",
  "jpeg",
];

function getFileType(_mime: string, name: string): DocumentFileType | null {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, DocumentFileType> = {
    pdf: "pdf",
    docx: "docx",
    doc: "doc",
    png: "png",
    jpg: "jpg",
    jpeg: "jpeg",
  };
  return ext ? map[ext] ?? null : null;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const fileType = getFileType(file.type, file.name);
    if (!fileType || !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, DOC, or images." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createSupabaseRouteClient(request);

    const doc = await documentsDb.createDocument(supabase, {
      user_id: user.id,
      file_name: file.name,
      file_type: fileType,
      file_size_bytes: file.size,
      storage_path: "", // set after upload
      document_type: null,
      risk_score: null,
      analysis_json: null,
      extraction_method: null,
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Failed to create document record" },
        { status: 500 },
      );
    }

    const storagePath = await uploadDocument(
      supabase,
      user.id,
      doc.id,
      buffer,
      file.name,
      file.type,
    );

    await supabase
      .from("documents")
      .update({ storage_path: storagePath })
      .eq("id", doc.id);

    await logAction(supabase, user.id, "document_upload", doc.id, {
      file_name: file.name,
      file_size: file.size,
    });

    return NextResponse.json({
      documentId: doc.id,
      fileName: file.name,
      fileType,
      fileSize: file.size,
    });
  } catch (err) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
