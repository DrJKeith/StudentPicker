export type Guide = {
  id: string;
  title: string;
};

const guides: Guide[] = [];
const readinessByUser: Record<string, Record<string, { ready: boolean; reason: string }>> = {};

export async function ingestGuides(options: { replace?: boolean } = {}) {
  if (guides.length > 0 && !options.replace) {
    throw new Error("guides already ingested; use replace to overwrite");
  }
  guides.splice(0, guides.length, { id: "guide-1", title: "Guide 1" });
  return { count: guides.length, replaced: options.replace === true };
}

export async function listGuides() {
  return guides;
}

export function evaluateReadinessForGuide(params: { userId: string; guideId: string }) {
  const record = readinessByUser[params.userId] || {};
  const readiness = { ready: true, reason: "Minimum session completed" };
  record[params.guideId] = readiness;
  readinessByUser[params.userId] = record;
  return readiness;
}

export function resetReadiness() {
  Object.keys(readinessByUser).forEach((k) => delete readinessByUser[k]);
}

export function resetGuides() {
  guides.splice(0, guides.length);
}
