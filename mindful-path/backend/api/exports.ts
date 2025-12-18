import { Response } from "express";
import { enforceAuthenticated, AuthenticatedRequest, requireRole } from "./auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { createExportBundle, listExportsForUser } from "../services/exports";

export const exportsRoutes = (app: any) => {
  app.get(
    "/api/exports",
    enforceAuthenticated,
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      const exportsList = await listExportsForUser(req.user!.id);
      res.json(exportsList);
    })
  );

  app.post(
    "/api/exports",
    enforceAuthenticated,
    requireRole("student"),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { sessionId, format } = req.body as { sessionId: string; format?: "pdf" | "csv" | "json" };
        const bundle = await createExportBundle({ sessionId, userId: req.user!.id, format });
        res.status(201).json(bundle);
      } catch (err) {
        res.status(400).json({ error: (err as Error).message });
      }
    })
  );
};
