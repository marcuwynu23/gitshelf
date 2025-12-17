import {Request, Response, NextFunction} from "express";
import {AuthService} from "../services/AuthService";

const authService = new AuthService();

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
  user?: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({error: "Authentication required"});
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({error: "Invalid or expired token"});
      return;
    }

    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({error: "User not found"});
      return;
    }

    req.userId = decoded.userId;
    req.username = user.username;
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({error: "Authentication failed"});
  }
};
