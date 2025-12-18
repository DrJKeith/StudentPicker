import { Response } from "express";
import { enforceAuthenticated, AuthenticatedRequest, requireRole } from "./auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { JournalInput, getJournalsForUser, recordJournal } from "../services/journals";

export const journalsRoutes = (app: any) => {
  app.get(
    "/api/journals",
    enforceAuthenticated,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const journals = await getJournalsForUser(req.user!.id);
      res.json(journals);
    })
  );

  app.post(
    "/api/journals",
    enforceAuthenticated,
    requireRole("student"),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const body = req.body as JournalInput;
      if (!body.sessionId || typeof body.sessionId !== "string" || !body.content || typeof body.content !== "string") {
        return res.status(400).json({ error: "sessionId and content are required" });
      }
      const entry = await recordJournal({ ...body, userId: req.user!.id });
      res.status(201).json(entry);
    })
  );
};
