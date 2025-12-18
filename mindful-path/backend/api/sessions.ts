import { Response } from "express";
import { enforceAuthenticated, AuthenticatedRequest, requireRole } from "./auth";
import {
  listSessionsForUser,
  startSession,
  completeSession,
  SessionInput,
  deleteSessionForUser,
} from "../services/sessionEngine";
import { deleteAssessmentBySession } from "../services/assessments";
import { deleteJournalBySession } from "../services/journals";
import { deleteExportBySession } from "../services/exports";

export const sessionsRoutes = (app: any) => {
  app.get("/api/sessions", enforceAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const sessions = await listSessionsForUser(req.user!.id);
    res.json(sessions);
  });

  app.post("/api/sessions", enforceAuthenticated, requireRole("student"), async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as SessionInput;
    const session = await startSession({ ...body, userId: req.user!.id });
    res.status(201).json(session);
  });

  app.post(
    "/api/sessions/:id/complete",
    enforceAuthenticated,
    requireRole("student"),
    async (req: AuthenticatedRequest, res: Response) => {
      const session = await completeSession({
        sessionId: req.params.id,
        userId: req.user!.id,
      });
      res.json(session);
    }
  );

  app.delete(
    "/api/sessions/:id",
    enforceAuthenticated,
    requireRole("student"),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        deleteSessionForUser({ sessionId: req.params.id, userId: req.user!.id });
        deleteAssessmentBySession({ sessionId: req.params.id, userId: req.user!.id });
        deleteJournalBySession({ sessionId: req.params.id, userId: req.user!.id });
        deleteExportBySession({ sessionId: req.params.id, userId: req.user!.id });
        res.status(204).end();
      } catch (err) {
        res.status(404).json({ error: (err as Error).message });
      }
    }
  );
};
