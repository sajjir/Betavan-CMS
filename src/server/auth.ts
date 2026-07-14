import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "betavan-access-secret-987654";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "betavan-refresh-secret-123456";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function generateAccessToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

/**
 * Middleware to authenticate requests via Bearer token
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired access token" });
  }

  req.user = payload;
  next();
}

/**
 * Middleware to restrict route to ADMIN or EDITOR role
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
}
