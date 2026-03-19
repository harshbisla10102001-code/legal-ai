export type DocumentFileType =
  | "pdf"
  | "docx"
  | "doc"
  | "png"
  | "jpg"
  | "jpeg";

export type DocumentType =
  | "nda"
  | "vendor_agreement"
  | "employment_contract"
  | "fir"
  | "plaint"
  | "written_statement"
  | "court_order"
  | "other";

export type Severity = "HIGH" | "MEDIUM" | "LOW";

export type Finding = {
  severity: Severity;
  category: string;
  clause_excerpt: string;
  explanation: string;
  suggestion: string;
  indian_law_citation?: string;
};

export type DocumentAnalysis = {
  document_type: DocumentType;
  parties: string[];
  summary: string;
  risk_score: number;
  findings: Finding[];
  missing_clauses: string[];
  positive_aspects: string[];
  court_forum?: string;
  procedural_issues?: string[];
  ipc_sections?: string[];
  cpc_provisions?: string[];
  cognizable?: boolean;
  bailable?: boolean;
  key_directions?: string[];
  next_hearing_date?: string;
};

export type DocumentRecord = {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_path: string;
  document_type: string | null;
  risk_score: number | null;
  analysis_json: DocumentAnalysis | null;
  extraction_method: string | null;
  created_at: string;
};
