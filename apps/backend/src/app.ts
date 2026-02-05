import express from "express";
import cors from "cors";
import {loggerMiddleware} from "./middleware/logger";
import {rawBodyMiddleware} from "./middleware/rawBody";
import {jsonParserMiddleware} from "./middleware/jsonParser";
import {
  getInfoRefs,
  handleUploadPack,
  handleReceivePack,
} from "./routes/gitHttpRoutes";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import repoRoutes from "./routes/repoRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import activityRoutes from "./routes/activityRoutes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(loggerMiddleware);

  // ✅ Git routes MUST come before any body-parsing / raw-body capture middleware
  mountGitRoutes(app);

  // Normal API middleware (safe for JSON APIs)
  app.use(rawBodyMiddleware);
  app.use(jsonParserMiddleware);

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/repos", repoRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/activity", activityRoutes);

  app.get("/api/check", (_req, res) => res.send("Hello"));

  return app;
}

function mountGitRoutes(app: express.Express) {
  // Primary format
  app.get("/repository/:username/:repo/info/refs", getInfoRefs);
  app.post("/repository/:username/:repo/git-upload-pack", handleUploadPack);
  app.post("/repository/:username/:repo/git-receive-pack", handleReceivePack);

  // Backward compatibility formats (keep if you really need them)
  app.get("/:username/:repo/info/refs", getInfoRefs);
  app.post("/:username/:repo/git-upload-pack", handleUploadPack);
  app.post("/:username/:repo/git-receive-pack", handleReceivePack);

  app.get("/:repo/info/refs", getInfoRefs);
  app.post("/:repo/git-upload-pack", handleUploadPack);
  app.post("/:repo/git-receive-pack", handleReceivePack);

  app.get("/api/repos/:username/:repo/info/refs", getInfoRefs);
  app.post("/api/repos/:username/:repo/git-upload-pack", handleUploadPack);
  app.post("/api/repos/:username/:repo/git-receive-pack", handleReceivePack);

  app.get("/api/repos/:repo/info/refs", getInfoRefs);
  app.post("/api/repos/:repo/git-upload-pack", handleUploadPack);
  app.post("/api/repos/:repo/git-receive-pack", handleReceivePack);
}
