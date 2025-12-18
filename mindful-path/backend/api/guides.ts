import { Request, Response } from "express";
import { listGuides, ingestGuides } from "../services/readinessEngine";
import { enforceAuthenticated, requireRole, AuthenticatedRequest } from "./auth";

export const guideRoutes = (app: any) => {
  app.get("/api/guides", enforceAuthenticated, async (_req: AuthenticatedRequest, res: Response) => {
    const guides = await listGuides();
    res.json(guides);
  });

  app.post("/api/guides/ingest", enforceAuthenticated, requireRole("instructor"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const replace = req.query.replace === "true";
      const result = await ingestGuides({ replace });
      res.json(result);
    } catch (err) {
      res.status(409).json({ error: (err as Error).message });
    }
  });
};
