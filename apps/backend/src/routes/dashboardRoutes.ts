import {Router} from "express";
import {DashboardController} from "../controllers/DashboardController";

const router = Router();
const dashboardController = new DashboardController();

// Dashboard routes
router.get("/", (req, res) => dashboardController.getStats(req, res));

export default router;
