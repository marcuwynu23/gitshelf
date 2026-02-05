import { Request, Response } from "express";
import { ActivityService } from "../services/ActivityService";
import { AuthRequest } from "../middleware/auth";

const activityService = new ActivityService();

export class ActivityController {
  async getActivities(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await activityService.getUserActivities(req.userId, limit, offset);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      await activityService.markAsRead(id, req.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking activity as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await activityService.markAllAsRead(req.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all activities as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await activityService.getUnreadCount(req.userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
