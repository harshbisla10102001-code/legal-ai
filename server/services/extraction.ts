import type { DocumentFileType } from "@/types";

export type ExtractionResult = {
  text: string;
  method: "pdf-parse" | "mammoth" | "tesseract";
};

const MIN_TEXT_LENGTH = 50;

export async function extractText(
  buffer: Buffer,
  fileType: DocumentFileType,
): Promise<ExtractionResult> {
  const normalized = fileType.toLowerCase() as DocumentFileType;

  if (normalized === "pdf") {
    return extractFromPdf(buffer);
  }

  if (normalized === "docx" || normalized === "doc") {
    return extractFromDocx(buffer);
  }

  if (["png", "jpg", "jpeg"].includes(normalized)) {
    return extractFromImage(buffer);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  const { extractText: unpdfExtractText, getDocumentProxy } = await import(
    "unpdf"
  );
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await unpdfExtractText(pdf, { mergePages: true });
  const trimmed = (text ?? "").trim();
  if (trimmed.length < MIN_TEXT_LENGTH) {
    throw new Error(
      "PDF appears to be scanned or image-based. Text extraction yielded minimal content. Please use a digital PDF or upload as an image for OCR.",
    );
  }
  return { text: trimmed, method: "pdf-parse" };
}

async function extractFromDocx(buffer: Buffer): Promise<ExtractionResult> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value ?? "").trim();
  if (!text) {
    throw new Error("Could not extract text from document.");
  }
  return { text, method: "mammoth" };
}

const OCR_TIMEOUT_MS = 90_000; // 90 seconds for large images

async function extractFromImage(buffer: Buffer): Promise<ExtractionResult> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng");

  const recognizeWithTimeout = (): Promise<{ text: string }> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        worker.terminate().catch(() => {});
        reject(
          new Error(
            "OCR is taking too long. Try a smaller image (under 1MB) or a simpler document.",
          ),
        );
      }, OCR_TIMEOUT_MS);

      worker
        .recognize(buffer)
        .then(({ data }) => {
          clearTimeout(timer);
          resolve({ text: data.text ?? "" });
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });

  try {
    const { text } = await recognizeWithTimeout();
    await worker.terminate();
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("Could not extract text from image.");
    }
    return { text: trimmed, method: "tesseract" };
  } catch (err) {
    await worker.terminate().catch(() => {});
    throw err;
  }
}
