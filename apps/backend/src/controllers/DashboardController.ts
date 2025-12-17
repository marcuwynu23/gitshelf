import {Response} from "express";
import {AuthRequest} from "../middleware/auth";
import {DashboardService} from "../services/DashboardService";
import {getServerURL} from "../utils/serverUrl";

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const httpBaseURL = getServerURL(req);
      const stats = await dashboardService.getDashboardStats(
        req.username!,
        httpBaseURL
      );
      res.json(stats);
    } catch (err) {
      console.error("GET /api/dashboard error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
