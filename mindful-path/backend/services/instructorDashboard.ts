import { listSessionsForUser, SessionRecord } from "./sessionEngine";
import { listGuides } from "./readinessEngine";
import { listExportsForUser } from "./exports";

export type GuideSummary = {
  guideId: string;
  title?: string;
  totalSessions: number;
  completedSessions: number;
  readinessReadyCount: number;
};

export type InstructorOverview = {
  guides: GuideSummary[];
  exportsCount: number;
};

export async function buildInstructorOverview(_instructorId: string, studentIds: string[]) {
  // Aggregated view only; no journal/assessment content exposed.
  const guides = await listGuides();
  const guideSummaries: GuideSummary[] = guides.map((g) => ({
    guideId: g.id,
    title: g.title,
    totalSessions: 0,
    completedSessions: 0,
    readinessReadyCount: 0,
  }));

  const guideIndex = new Map<string, GuideSummary>(guideSummaries.map((g) => [g.guideId, g]));

  for (const studentId of studentIds) {
    const sessions = await listSessionsForUser(studentId);
    sessions.forEach((s: SessionRecord) => {
      const summary = guideIndex.get(s.guideId);
      if (!summary) return;
      summary.totalSessions += 1;
      if (s.status === "completed") {
        summary.completedSessions += 1;
      }
      if (s.readiness?.ready) {
        summary.readinessReadyCount += 1;
      }
    });
  }

  const exportsCount = (await Promise.all(studentIds.map((id) => listExportsForUser(id)))).flat().length;

  return {
    guides: Array.from(guideIndex.values()),
    exportsCount,
  } as InstructorOverview;
}
