import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { DocumentAnalysis, DocumentRecord } from "@/types";

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const parts = Object.values(value as Record<string, unknown>).filter(
      (v) => typeof v === "string",
    );
    return parts.join(" — ") || JSON.stringify(value);
  }
  return String(value ?? "");
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 8, fontWeight: "bold" },
  meta: { fontSize: 10, color: "#666", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  body: { fontSize: 10, lineHeight: 1.4 },
  riskBadge: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  finding: {
    marginBottom: 12,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ccc",
    paddingLeft: 10,
  },
  findingHigh: { borderLeftColor: "#dc2626" },
  findingMedium: { borderLeftColor: "#f59e0b" },
  findingLow: { borderLeftColor: "#22c55e" },
  clause: {
    fontFamily: "Courier",
    fontSize: 9,
    backgroundColor: "#f5f5f5",
    padding: 6,
    marginVertical: 4,
  },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#999" },
});

function riskColor(score: number) {
  if (score <= 40) return "#22c55e";
  if (score <= 70) return "#f59e0b";
  return "#dc2626";
}

export function ReportDocument({
  document,
  analysis,
}: {
  document: DocumentRecord;
  analysis: DocumentAnalysis;
}) {
  const riskStyle = {
    ...styles.riskBadge,
    backgroundColor: riskColor(analysis.risk_score),
    color: "#fff",
  };

  return (
    <Document
      title={`Risk Analysis: ${document.file_name}`}
      author="LegalAI"
      subject="Document Risk Analysis"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Document Risk Analysis</Text>
        <Text style={styles.meta}>
          {document.file_name} • {new Date(document.created_at).toLocaleDateString()} •
          AI-generated report
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Risk Score</Text>
          <View style={riskStyle}>
            <Text>{analysis.risk_score}/100</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Type</Text>
          <Text style={styles.body}>
            {analysis.document_type.replace(/_/g, " ")}
          </Text>
        </View>

        {analysis.parties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parties Identified</Text>
            <Text style={styles.body}>{analysis.parties.map(toText).join(", ")}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.body}>{analysis.summary}</Text>
        </View>

        {analysis.findings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Findings</Text>
            {analysis.findings.map((f, i) => {
              const severityStyle =
                f.severity === "HIGH"
                  ? styles.findingHigh
                  : f.severity === "MEDIUM"
                    ? styles.findingMedium
                    : f.severity === "LOW"
                      ? styles.findingLow
                      : {};
              return (
              <View key={i} style={[styles.finding, severityStyle]}>
                <Text style={styles.body}>
                  [{f.severity}] {f.category}
                </Text>
                {f.clause_excerpt && (
                  <Text style={styles.clause}>{f.clause_excerpt}</Text>
                )}
                <Text style={styles.body}>{f.explanation}</Text>
                <Text style={styles.body}>Suggestion: {f.suggestion}</Text>
                {f.indian_law_citation && (
                  <Text style={styles.body}>
                    Citation: {f.indian_law_citation}
                  </Text>
                )}
              </View>
            );
            })}
          </View>
        )}

        {analysis.missing_clauses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Missing Clauses</Text>
            {analysis.missing_clauses.map((c, i) => (
              <Text key={i} style={styles.body}>
                • {toText(c)}
              </Text>
            ))}
          </View>
        )}

        {analysis.positive_aspects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Positive Aspects</Text>
            {analysis.positive_aspects.map((p, i) => (
              <Text key={i} style={styles.body}>
                • {toText(p)}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          This report was generated by LegalAI. It is for informational
          purposes only and does not constitute legal advice.
        </Text>
      </Page>
    </Document>
  );
}
