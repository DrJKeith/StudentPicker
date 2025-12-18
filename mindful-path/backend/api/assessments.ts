import { Response } from "express";
import { enforceAuthenticated, AuthenticatedRequest, requireRole } from "./auth";
import { AssessmentInput, getAssessmentsForUser, recordAssessment } from "../services/assessments";

export const assessmentsRoutes = (app: any) => {
  app.get("/api/assessments", enforceAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const assessments = await getAssessmentsForUser(req.user!.id);
    res.json(assessments);
  });

  app.post("/api/assessments", enforceAuthenticated, requireRole("student"), async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as AssessmentInput;
    const assessment = await recordAssessment({ ...body, userId: req.user!.id });
    res.status(201).json(assessment);
  });
};
