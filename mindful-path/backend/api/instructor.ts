import { Response } from "express";
import { AuthenticatedRequest, enforceAuthenticated, requireRole } from "./auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { buildInstructorOverview } from "../services/instructorDashboard";

export const instructorRoutes = (app: any) => {
  app.get(
    "/api/instructor",
    enforceAuthenticated,
    requireRole("instructor"),
    asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
      // Student list would come from enrollment; placeholder uses header for explicit scoping.
      const studentIdsHeader = req.header("x-student-ids") || "";
      const studentIds = studentIdsHeader.split(",").filter(Boolean);
      const overview = await buildInstructorOverview(req.user!.id, studentIds);
      res.json(overview);
    })
  );
};
