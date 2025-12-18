import { Request, Response } from "express";
import { enforceAuthenticated } from "./auth";

export const remindersRoutes = (app: any) => {
  app.get("/api/reminders", enforceAuthenticated, async (_req: Request, res: Response) => {
    res.json([]);
  });
};
