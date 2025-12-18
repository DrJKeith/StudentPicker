import { Response } from "express";
import { enforceAuthenticated, AuthenticatedRequest, requireRole } from "./auth";
import { JournalInput, getJournalsForUser, recordJournal } from "../services/journals";

export const journalsRoutes = (app: any) => {
  app.get("/api/journals", enforceAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const journals = await getJournalsForUser(req.user!.id);
    res.json(journals);
  });

  app.post("/api/journals", enforceAuthenticated, requireRole("student"), async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as JournalInput;
    const entry = await recordJournal({ ...body, userId: req.user!.id });
    res.status(201).json(entry);
  });
};
