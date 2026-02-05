import { Router } from "express";
import { ActivityController } from "../controllers/ActivityController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const activityController = new ActivityController();

// All routes require authentication
router.use(authMiddleware);

router.get("/", activityController.getActivities);
router.get("/unread-count", activityController.getUnreadCount);
router.put("/read-all", activityController.markAllAsRead);
router.put("/:id/read", activityController.markAsRead);

export default router;
