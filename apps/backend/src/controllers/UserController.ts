import {Response} from "express";
import {AuthRequest} from "../middleware/auth";
import {UserService} from "../services/UserService";
import bcrypt from "bcryptjs";

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const user = await userService.findById(req.userId);
      if (!user) {
        res.status(404).json({error: "User not found"});
        return;
      }

      res.json(userService.toPublic(user));
    } catch (err) {
      console.error("GET /api/user/profile error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const {name, email, bio} = req.body;
      const updates: any = {};

      if (name !== undefined) updates.name = name;
      if (bio !== undefined) updates.bio = bio;
      // Email updates could require verification, so we'll skip for now

      const updatedUser = await userService.update(req.userId, updates);
      res.json(userService.toPublic(updatedUser));
    } catch (err: any) {
      console.error("PUT /api/user/profile error:", err);
      if (err.message === "User not found") {
        res.status(404).json({error: err.message});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const {currentPassword, newPassword} = req.body;

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({error: "Current password and new password are required"});
        return;
      }

      if (newPassword.length < 8) {
        res
          .status(400)
          .json({error: "Password must be at least 8 characters long"});
        return;
      }

      const user = await userService.findById(req.userId);
      if (!user) {
        res.status(404).json({error: "User not found"});
        return;
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        res.status(401).json({error: "Current password is incorrect"});
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userService.updatePassword(req.userId, hashedPassword);

      res.json({message: "Password changed successfully"});
    } catch (err: any) {
      console.error("PUT /api/user/password error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
