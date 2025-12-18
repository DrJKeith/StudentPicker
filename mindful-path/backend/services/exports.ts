import { getAssessmentBySession } from "./assessments";
import { getJournalBySession } from "./journals";
import { getSessionById } from "./sessionEngine";
import { generatePdfBundle } from "./pdfExporter";

export type ExportBundle = {
  id: string;
  sessionId: string;
  userId: string;
  guideId: string;
  createdAt: string;
  format: "pdf" | "csv" | "json";
  path?: string;
  payload: {
    session: unknown;
    assessment?: unknown;
    journal?: unknown;
  };
};

const exportBundles: ExportBundle[] = [];

export async function createExportBundle(params: { sessionId: string; userId: string; format?: "pdf" | "csv" | "json" }) {
  const session = getSessionById(params.sessionId);
  if (!session || session.userId !== params.userId) {
    throw new Error("session not found for user");
  }

  const assessment = await getAssessmentBySession(params.sessionId, params.userId);
  const journal = await getJournalBySession(params.sessionId, params.userId);

  const payload = {
    session,
    assessment,
    journal,
    readiness: session.readiness,
  };

  const format = params.format || "pdf";
  let path: string | undefined;
  if (format === "pdf") {
    path = await generatePdfBundle({ session, assessment, journal });
  }

  const bundle: ExportBundle = {
    id: `export-${Date.now()}-${exportBundles.length + 1}`,
    sessionId: session.id,
    userId: session.userId,
    guideId: session.guideId,
    createdAt: new Date().toISOString(),
    format,
    path,
    payload,
  };
  exportBundles.push(bundle);
  return bundle;
}

export async function listExportsForUser(userId: string) {
  return exportBundles.filter((e) => e.userId === userId);
}

export function resetExports() {
  exportBundles.splice(0, exportBundles.length);
}

export function deleteExportBySession(params: { sessionId: string; userId: string }) {
  for (let i = exportBundles.length - 1; i >= 0; i -= 1) {
    if (exportBundles[i].sessionId === params.sessionId && exportBundles[i].userId === params.userId) {
      exportBundles.splice(i, 1);
    }
  }
}
