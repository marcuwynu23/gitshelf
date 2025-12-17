import {Router} from "express";
import {AuthController} from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/recovery", (req, res) => authController.recovery(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
