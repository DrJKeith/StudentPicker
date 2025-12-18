import express from "express";
import type { NextFunction, Request, Response } from "express";
import { guideRoutes } from "../api/guides";
import { sessionsRoutes } from "../api/sessions";
import { journalsRoutes } from "../api/journals";
import { assessmentsRoutes } from "../api/assessments";
import { exportsRoutes } from "../api/exports";
import { instructorRoutes } from "../api/instructor";
import { remindersRoutes } from "../api/reminders";
import { AuthenticatedRequest } from "../api/auth";

export function createApp() {
  const app = express();
  app.use(express.json());

  // Development-only user injection to exercise role guards without auth stack.
  app.use((req: AuthenticatedRequest, _res, next) => {
    const role = req.header("x-user-role");
    const userId = req.header("x-user-id");
    if (role && userId) {
      req.user = { id: userId, role: role === "instructor" ? "instructor" : "student" };
    }
    next();
  });

  guideRoutes(app);
  sessionsRoutes(app);
  journalsRoutes(app);
  assessmentsRoutes(app);
  exportsRoutes(app);
  instructorRoutes(app);
  remindersRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode || err.status || 500;
    const message = status >= 500 ? "Internal server error" : err.message ?? "Request failed";

    res.status(status).json({
      error: {
        message,
        code: err.code ?? undefined,
      },
    });
  });

  return app;
}
