import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { getDocument, updateDocumentAnalysis } from "@/server/db/documents";
import { downloadDocument } from "@/server/services/storage";
import { extractText } from "@/server/services/extraction";
import { analyzeDocument } from "@/server/services/document-analysis";
import { logAction } from "@/server/services/audit";
import type { DocumentFileType } from "@/types";

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

  if (document.analysis_json) {
    return NextResponse.json({
      done: true,
      document,
      analysis: document.analysis_json,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send({ step: 1, message: "Extracting text..." });

        const arrayBuffer = await downloadDocument(supabase, document.storage_path);
        const buffer = Buffer.from(arrayBuffer);
        const { text, method } = await extractText(
          buffer,
          document.file_type as DocumentFileType,
        );

        send({ step: 2, message: "Analyzing with AI..." });

        const analysis = await analyzeDocument(text);

        send({ step: 3, message: "Saving results..." });

        await updateDocumentAnalysis(
          supabase,
          id,
          analysis,
          method,
        );

        await logAction(supabase, user.id, "document_process", id);

        const updated = await getDocument(supabase, id);
        send({
          step: 4,
          done: true,
          document: updated,
          analysis,
        });
      } catch (err) {
        console.error("Document process error:", err);
        send({
          error: err instanceof Error ? err.message : "Processing failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
