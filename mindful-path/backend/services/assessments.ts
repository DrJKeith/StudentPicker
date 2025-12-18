import { getSessionForUser } from "./sessionEngine";

export type AssessmentRecord = {
  id: string;
  sessionId: string;
  userId: string;
  responses: Record<string, unknown>;
  createdAt: string;
};

const assessments: AssessmentRecord[] = [];

export type AssessmentInput = {
  sessionId: string;
  responses: Record<string, unknown>;
};

export async function recordAssessment(input: AssessmentInput & { userId: string }) {
  const session = getSessionForUser(input.sessionId, input.userId);
  if (session.status !== "completed") {
    throw new Error("assessment allowed after session completion");
  }
  const record: AssessmentRecord = {
    id: `assessment-${Date.now()}-${assessments.length + 1}`,
    sessionId: input.sessionId,
    userId: input.userId,
    responses: input.responses,
    createdAt: new Date().toISOString(),
  };
  assessments.push(record);
  return record;
}

export async function getAssessmentsForUser(userId: string) {
  return assessments.filter((a) => a.userId === userId);
}

export async function getAssessmentBySession(sessionId: string, userId: string) {
  return assessments.find((a) => a.sessionId === sessionId && a.userId === userId);
}

export function resetAssessments() {
  assessments.splice(0, assessments.length);
}

export function deleteAssessmentBySession(params: { sessionId: string; userId: string }) {
  for (let i = assessments.length - 1; i >= 0; i -= 1) {
    if (assessments[i].sessionId === params.sessionId && assessments[i].userId === params.userId) {
      assessments.splice(i, 1);
    }
  }
}
