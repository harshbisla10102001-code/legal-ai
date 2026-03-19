import Groq from "groq-sdk";
import { getGroqApiKey, GROQ_MODEL } from "@/server/config";
import type { DocumentAnalysis, DocumentType } from "@/types";

const SYSTEM_PROMPT = `You are LegalAI, an expert legal analyst for Indian law. Analyze the provided legal document and return a structured JSON object.

For CONTRACTS (NDA, vendor agreement, employment contract, etc.):
- Identify document_type, parties, and a 2-3 sentence summary.
- Assign risk_score 0-100 (0=low risk, 100=high risk). Consider: missing indemnity caps, unlimited liability, one-sided termination, weak dispute resolution, missing jurisdiction, weak confidentiality.
- List findings: each with severity (HIGH/MEDIUM/LOW), category (e.g. Indemnity, Jurisdiction, Termination), clause_excerpt (exact quote from doc), explanation (plain English), suggestion (how to fix), indian_law_citation (e.g. "Indian Contract Act §73", "Arbitration and Conciliation Act 1996").
- List missing_clauses: standard protections absent (e.g. arbitration, limitation of liability, force majeure).
- List positive_aspects: well-drafted protective clauses.

For CASE FILES (FIR, plaint, written statement, court order):
- Identify document_type, parties, summary.
- Assign risk_score based on procedural soundness.
- List procedural_issues: missing cause of action, improper jurisdiction, limitation period concerns.
- Include court_forum: suggested appropriate court (District, High Court, Supreme Court).
- For FIR: ipc_sections, cognizable, bailable.
- For plaint/statement: cpc_provisions.
- For court orders: key_directions, next_hearing_date.

Return ONLY valid JSON matching this structure. No markdown, no code block wrapper.`;

const AI_TIMEOUT_MS = 60_000;

export async function analyzeDocument(
  extractedText: string,
): Promise<DocumentAnalysis> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com",
    );
  }

  const groq = new Groq({ apiKey });

  const truncated =
    extractedText.length > 12000
      ? extractedText.slice(0, 12000) + "\n\n[Document truncated...]"
      : extractedText;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let response;
  try {
    response = await groq.chat.completions.create(
      {
        model: GROQ_MODEL,
        max_tokens: 4096,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this legal document:\n\n${truncated}`,
          },
        ],
        response_format: { type: "json_object" },
      },
      { signal: controller.signal },
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("AI analysis timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const raw =
    response.choices[0]?.message?.content ??
    '{"document_type":"other","parties":[],"summary":"","risk_score":50,"findings":[],"missing_clauses":[],"positive_aspects":[]}';

  const parsed = JSON.parse(raw) as Record<string, unknown>;

  return normalizeAnalysis(parsed);
}

function toStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const parts = Object.values(v as Record<string, unknown>).filter(
      (x) => typeof x === "string",
    );
    return parts.join(" — ") || JSON.stringify(v);
  }
  return String(v ?? "");
}

function toStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(toStr);
}

function normalizeAnalysis(raw: Record<string, unknown>): DocumentAnalysis {
  const docType = (raw.document_type as string) ?? "other";
  const validTypes: DocumentType[] = [
    "nda",
    "vendor_agreement",
    "employment_contract",
    "fir",
    "plaint",
    "written_statement",
    "court_order",
    "other",
  ];
  const document_type = validTypes.includes(docType as DocumentType)
    ? (docType as DocumentType)
    : "other";

  const parties = toStringArray(raw.parties);
  const summary = typeof raw.summary === "string" ? raw.summary : "";
  const risk_score = typeof raw.risk_score === "number"
    ? Math.max(0, Math.min(100, raw.risk_score))
    : 50;

  const findings = Array.isArray(raw.findings)
    ? (raw.findings as Record<string, unknown>[]).map((f) => ({
        severity: (f.severity as "HIGH" | "MEDIUM" | "LOW") ?? "MEDIUM",
        category: String(f.category ?? ""),
        clause_excerpt: String(f.clause_excerpt ?? ""),
        explanation: String(f.explanation ?? ""),
        suggestion: String(f.suggestion ?? ""),
        indian_law_citation:
          typeof f.indian_law_citation === "string"
            ? f.indian_law_citation
            : undefined,
      }))
    : [];

  const missing_clauses = toStringArray(raw.missing_clauses);
  const positive_aspects = toStringArray(raw.positive_aspects);

  const result: DocumentAnalysis = {
    document_type,
    parties,
    summary,
    risk_score,
    findings,
    missing_clauses,
    positive_aspects,
  };

  if (typeof raw.court_forum === "string") result.court_forum = raw.court_forum;
  if (Array.isArray(raw.procedural_issues))
    result.procedural_issues = raw.procedural_issues as string[];
  if (Array.isArray(raw.ipc_sections))
    result.ipc_sections = raw.ipc_sections as string[];
  if (Array.isArray(raw.cpc_provisions))
    result.cpc_provisions = raw.cpc_provisions as string[];
  if (typeof raw.cognizable === "boolean") result.cognizable = raw.cognizable;
  if (typeof raw.bailable === "boolean") result.bailable = raw.bailable;
  if (Array.isArray(raw.key_directions))
    result.key_directions = raw.key_directions as string[];
  if (typeof raw.next_hearing_date === "string")
    result.next_hearing_date = raw.next_hearing_date;

  return result;
}
