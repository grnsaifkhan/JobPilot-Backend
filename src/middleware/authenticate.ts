import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { success } from "zod";

export interface AuthenticationRequest extends Request {
  userId?: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !/^\d+$/.test(payload.sub)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });

      return;
    }

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    (req as AuthenticationRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
