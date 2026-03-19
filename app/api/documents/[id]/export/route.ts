import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/server/services/auth";
import { createSupabaseRouteClient } from "@/server/db/supabase";
import { getDocument } from "@/server/db/documents";
import { logAction } from "@/server/services/audit";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/server/pdf/ReportDocument";

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

  if (!document.analysis_json) {
    return NextResponse.json(
      { error: "Document has not been analyzed yet" },
      { status: 400 },
    );
  }

  await logAction(supabase, user.id, "document_export", id);

  const docElement = React.createElement(ReportDocument, {
    document,
    analysis: document.analysis_json,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(docElement as any);

  const safeName = document.file_name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `risk-analysis-${safeName}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
