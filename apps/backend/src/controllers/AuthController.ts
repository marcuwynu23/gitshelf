import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, name, email, password } = req.body;

      if (!username || !name || !email || !password) {
        res.status(400).json({ error: "Username, name, email, and password are required" });
        return;
      }

      const result = await authService.register({ name, username, email, password });
      res.status(201).json(result);
    } catch (err: any) {
      console.error("POST /api/auth/register error:", err);
      if (
        err.message === "Email already registered" ||
        err.message === "Username already taken" ||
        err.message.includes("Password") ||
        err.message.includes("Username")
      ) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      const result = await authService.login({ username, password });
      res.json(result);
    } catch (err: any) {
      console.error("POST /api/auth/login error:", err);
      if (err.message === "Invalid username or password") {
        res.status(401).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async recovery(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      await authService.requestPasswordRecovery(email);
      // Always return success to prevent email enumeration
      res.json({ message: "If the email exists, a recovery link has been sent" });
    } catch (err) {
      console.error("POST /api/auth/recovery error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // With JWT, logout is handled client-side by removing the token
    // Server-side logout would require token blacklisting (not implemented)
    res.json({ message: "Logged out successfully" });
  }
}
