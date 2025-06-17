import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface requestWithUser extends Request {
  user?: { id: string; email: string; fullName: string };
}

export const authMiddleware = (
  req: requestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded as requestWithUser["user"];
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
};
