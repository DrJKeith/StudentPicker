import { getSessionForUser } from "./sessionEngine";

export type JournalEntry = {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  createdAt: string;
};

const journals: JournalEntry[] = [];

export type JournalInput = {
  sessionId: string;
  content: string;
};

export async function recordJournal(input: JournalInput & { userId: string }) {
  const session = getSessionForUser(input.sessionId, input.userId);
  if (session.status !== "completed") {
    throw new Error("journal allowed after session completion");
  }
  const entry: JournalEntry = {
    id: `journal-${Date.now()}-${journals.length + 1}`,
    sessionId: input.sessionId,
    userId: input.userId,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  journals.push(entry);
  return entry;
}

export async function getJournalsForUser(userId: string) {
  return journals.filter((j) => j.userId === userId);
}

export async function getJournalBySession(sessionId: string, userId: string) {
  return journals.find((j) => j.sessionId === sessionId && j.userId === userId);
}

export function resetJournals() {
  journals.splice(0, journals.length);
}

export function deleteJournalBySession(params: { sessionId: string; userId: string }) {
  for (let i = journals.length - 1; i >= 0; i -= 1) {
    if (journals[i].sessionId === params.sessionId && journals[i].userId === params.userId) {
      journals.splice(i, 1);
    }
  }
}
