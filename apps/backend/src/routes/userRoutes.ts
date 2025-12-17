import {Router} from "express";
import {UserController} from "../controllers/UserController";
import {authMiddleware} from "../middleware/auth";

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authMiddleware);

router.get("/profile", (req, res) => userController.getProfile(req, res));
router.put("/profile", (req, res) => userController.updateProfile(req, res));
router.put("/password", (req, res) => userController.changePassword(req, res));

export default router;
