import express from "express";
import {loggerMiddleware} from "./middleware/logger";
import {rawBodyMiddleware} from "./middleware/rawBody";
import {jsonParserMiddleware} from "./middleware/jsonParser";
import {
  getInfoRefs,
  handleUploadPack,
  handleReceivePack,
} from "./routes/gitHttpRoutes";
import repoRoutes from "./routes/repoRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import {PORT, SSH_PORT} from "./utils/config";
import {SshServerService} from "./services/SshServerService";

const app = express();

// Middleware
app.use(loggerMiddleware);
app.use(rawBodyMiddleware);
app.use(jsonParserMiddleware);

// Git HTTP routes - Standard format (/:repo/info/refs)
// These must be before API routes to avoid conflicts
app.get("/:repo/info/refs", getInfoRefs);
app.post("/:repo/git-upload-pack", handleUploadPack);
app.post("/:repo/git-receive-pack", handleReceivePack);

// Git HTTP routes - API format (/api/repos/:repo/info/refs) for consistency
app.get("/api/repos/:repo/info/refs", getInfoRefs);
app.post("/api/repos/:repo/git-upload-pack", handleUploadPack);
app.post("/api/repos/:repo/git-receive-pack", handleReceivePack);

// API routes
app.use("/api/repos", repoRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check endpoint
app.get("/api/check", (_req, res) => {
  res.send("Hello");
});

// Start HTTP server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Git API running on port ${PORT}...`)
);

// Start SSH server (if enabled)
if (process.env.ENABLE_SSH !== "false") {
  try {
    const sshServer = new SshServerService(SSH_PORT);
    sshServer.start();
  } catch (error) {
    console.error("Failed to start SSH server:", error);
    console.log("SSH server disabled. Install 'ssh2' package to enable:");
    console.log("  npm install ssh2 @types/ssh2");
  }
}
