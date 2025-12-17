import {Router} from "express";
import {SettingsController} from "../controllers/SettingsController";
import {authMiddleware} from "../middleware/auth";

const router = Router();
const settingsController = new SettingsController();

// All settings routes require authentication
router.use(authMiddleware);

router.get("/", (req, res) => settingsController.getSettings(req, res));
router.put("/", (req, res) => settingsController.updateSettings(req, res));

export default router;

