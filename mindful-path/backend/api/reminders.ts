import { Request, Response } from "express";
import { enforceAuthenticated } from "./auth";
import { asyncHandler } from "../middleware/asyncHandler";

export const remindersRoutes = (app: any) => {
  app.get(
    "/api/reminders",
    enforceAuthenticated,
    asyncHandler(async (_req: Request, res: Response) => {
      res.json([]);
    })
  );
};
