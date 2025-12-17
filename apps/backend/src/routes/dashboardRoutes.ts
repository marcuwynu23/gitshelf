import {Router} from "express";
import {DashboardController} from "../controllers/DashboardController";
import {authMiddleware} from "../middleware/auth";

const router = Router();
const dashboardController = new DashboardController();

// Dashboard routes require authentication
router.use(authMiddleware);

router.get("/", (req, res) => dashboardController.getStats(req, res));

export default router;
