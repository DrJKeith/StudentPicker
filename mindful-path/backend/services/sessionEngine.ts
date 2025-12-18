import { evaluateReadinessForGuide } from "./readinessEngine";

export type SessionStatus = "in_progress" | "completed";

export type SessionRecord = {
  id: string;
  userId: string;
  guideId: string;
  durationMinutes: number;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
  readiness?: {
    ready: boolean;
    reason: string;
  };
};

export type SessionInput = {
  guideId: string;
  durationMinutes: number;
};

const sessions: SessionRecord[] = [];

const MIN_DURATION = 5;
const MAX_DURATION = 60;

function validateDuration(durationMinutes: number) {
  if (durationMinutes < MIN_DURATION || durationMinutes > MAX_DURATION) {
    throw new Error(`duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes`);
  }
}

export async function startSession(input: SessionInput & { userId: string }) {
  validateDuration(input.durationMinutes);
  const session: SessionRecord = {
    id: `session-${Date.now()}-${sessions.length + 1}`,
    userId: input.userId,
    guideId: input.guideId,
    durationMinutes: input.durationMinutes,
    status: "in_progress",
    startedAt: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export async function completeSession(params: { sessionId: string; userId: string }) {
  const session = getSessionForUser(params.sessionId, params.userId);
  session.status = "completed";
  session.completedAt = new Date().toISOString();
  session.readiness = evaluateReadinessForGuide({
    guideId: session.guideId,
    userId: session.userId,
  });
  return session;
}

export async function listSessionsForUser(userId: string) {
  return sessions.filter((s) => s.userId === userId);
}

export function getSessionForUser(sessionId: string, userId: string) {
  const session = sessions.find((s) => s.id === sessionId && s.userId === userId);
  if (!session) {
    throw new Error("session not found");
  }
  return session;
}

export function getSessionById(sessionId: string) {
  return sessions.find((s) => s.id === sessionId);
}

export function resetSessions() {
  sessions.splice(0, sessions.length);
}

export function deleteSessionForUser(params: { sessionId: string; userId: string }) {
  const index = sessions.findIndex((s) => s.id === params.sessionId && s.userId === params.userId);
  if (index === -1) {
    throw new Error("session not found");
  }
  sessions.splice(index, 1);
}
