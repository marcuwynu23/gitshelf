import {Request, Response} from "express";
import {DashboardService} from "../services/DashboardService";
import {getServerURL} from "../utils/serverUrl";

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const httpBaseURL = getServerURL(req);
      const stats = await dashboardService.getDashboardStats(httpBaseURL);
      res.json(stats);
    } catch (err) {
      console.error("GET /api/dashboard error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
