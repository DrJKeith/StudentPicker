import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { resetSessions } from "../services/sessionEngine";
import { resetReadiness, ingestGuides, resetGuides } from "../services/readinessEngine";
import { resetAssessments } from "../services/assessments";
import { resetJournals } from "../services/journals";
import { resetExports } from "../services/exports";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env.test"), override: true });

describe("API integration", () => {
  const app = createApp();
  const studentHeaders = { "x-user-id": "student-1", "x-user-role": "student" } as const;
  const otherStudentHeaders = { "x-user-id": "student-2", "x-user-role": "student" } as const;
  const instructorHeaders = { "x-user-id": "instructor-1", "x-user-role": "instructor" } as const;

  beforeEach(async () => {
    resetSessions();
    resetReadiness();
    resetGuides();
    resetAssessments();
    resetJournals();
    resetExports();
    await ingestGuides();
  });

  it("prevents IDOR: student cannot access another student's sessions", async () => {
    await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 10 })
      .expect(201);

    const otherList = await request(app).get("/api/sessions").set(otherStudentHeaders).expect(200);
    expect(otherList.body).toHaveLength(0);
  });

  it("prevents instructor from reading journal text by default", async () => {
    const sessionRes = await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 10 })
      .expect(201);

    await request(app)
      .post(`/api/sessions/${sessionRes.body.id}/complete`)
      .set(studentHeaders)
      .expect(200);

    await request(app)
      .post("/api/journals")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, content: "Private reflection" })
      .expect(201);

    const instructorJournals = await request(app).get("/api/journals").set(instructorHeaders).expect(200);
    expect(instructorJournals.body).toEqual([]);
  });

  it("links assessment and journal to the session", async () => {
    const sessionRes = await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 15 })
      .expect(201);

    await request(app)
      .post(`/api/sessions/${sessionRes.body.id}/complete`)
      .set(studentHeaders)
      .expect(200);

    const assessmentRes = await request(app)
      .post("/api/assessments")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, responses: { mood: "calm" } })
      .expect(201);

    const journalRes = await request(app)
      .post("/api/journals")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, content: "Reflection text" })
      .expect(201);

    expect(assessmentRes.body.sessionId).toBe(sessionRes.body.id);
    expect(journalRes.body.sessionId).toBe(sessionRes.body.id);
  });

  it("exports bundle with file path and metadata", async () => {
    const sessionRes = await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 20 })
      .expect(201);

    await request(app)
      .post(`/api/sessions/${sessionRes.body.id}/complete`)
      .set(studentHeaders)
      .expect(200);

    await request(app)
      .post("/api/assessments")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, responses: { focus: "steady" } })
      .expect(201);

    await request(app)
      .post("/api/journals")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, content: "Exportable reflection" })
      .expect(201);

    const exportRes = await request(app)
      .post("/api/exports")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, format: "pdf" })
      .expect(201);

    expect(exportRes.body.path).toBeTruthy();
    expect(exportRes.body.payload.session.id).toBe(sessionRes.body.id);
    expect(exportRes.body.payload.assessment).toBeTruthy();
    expect(exportRes.body.payload.journal).toBeTruthy();
  });

  it("instructor summaries include readiness counts without journal text", async () => {
    const sessionRes = await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 12 })
      .expect(201);

    await request(app)
      .post(`/api/sessions/${sessionRes.body.id}/complete`)
      .set(studentHeaders)
      .expect(200);

    await request(app)
      .post("/api/journals")
      .set(studentHeaders)
      .send({ sessionId: sessionRes.body.id, content: "Hidden journal" })
      .expect(201);

    const overview = await request(app)
      .get("/api/instructor")
      .set(instructorHeaders)
      .set("x-student-ids", "student-1")
      .expect(200);

    expect(overview.body.guides[0].totalSessions).toBeGreaterThanOrEqual(1);
    expect(overview.body.guides[0].readinessReadyCount).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(overview.body)).not.toContain("Hidden journal");
  });

  it("exports are limited to student-owned sessions", async () => {
    const session1 = await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 10 })
      .expect(201);

    const session2 = await request(app)
      .post("/api/sessions")
      .set(otherStudentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 10 })
      .expect(201);

    await request(app)
      .post(`/api/sessions/${session2.body.id}/complete`)
      .set(otherStudentHeaders)
      .expect(200);

    const badExport = await request(app)
      .post("/api/exports")
      .set(studentHeaders)
      .send({ sessionId: session2.body.id, format: "pdf" })
      .expect(400);

    expect(badExport.body.error).toMatch(/session not found/);

    const goodExport = await request(app)
      .post("/api/exports")
      .set(studentHeaders)
      .send({ sessionId: session1.body.id, format: "pdf" })
      .expect(201);

    expect(goodExport.body.sessionId).toBe(session1.body.id);
  });

  it("student cannot delete another student's data", async () => {
    const session1 = await request(app)
      .post("/api/sessions")
      .set(studentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 10 })
      .expect(201);

    const session2 = await request(app)
      .post("/api/sessions")
      .set(otherStudentHeaders)
      .send({ guideId: "guide-1", durationMinutes: 10 })
      .expect(201);

    await request(app)
      .delete(`/api/sessions/${session2.body.id}`)
      .set(studentHeaders)
      .expect(404);

    const verifyOther = await request(app).get("/api/sessions").set(otherStudentHeaders).expect(200);
    expect(verifyOther.body.map((s: any) => s.id)).toContain(session2.body.id);

    await request(app)
      .delete(`/api/sessions/${session1.body.id}`)
      .set(studentHeaders)
      .expect(204);

    const verifySelf = await request(app).get("/api/sessions").set(studentHeaders).expect(200);
    expect(verifySelf.body.map((s: any) => s.id)).not.toContain(session1.body.id);
  });

  it("guide ingestion requires explicit replace to overwrite", async () => {
    const conflict = await request(app)
      .post("/api/guides/ingest")
      .set(instructorHeaders)
      .expect(409);
    expect(conflict.body.error).toMatch(/replace/);

    await request(app)
      .post("/api/guides/ingest?replace=true")
      .set(instructorHeaders)
      .expect(200);
  });
});
