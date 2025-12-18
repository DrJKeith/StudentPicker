import { Request, Response } from "express";

type Role = "student" | "instructor";
export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: Role;
  };
};

export function enforceAuthenticated(req: AuthenticatedRequest, res: Response, next: () => void) {
  if (!req.user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  next();
}

export function requireRole(role: Role) {
  return (req: AuthenticatedRequest, res: Response, next: () => void) => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}
