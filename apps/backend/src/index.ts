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
import {PORT, SSH_PORT} from "./utils/config";
import {SshServerService} from "./services/SshServerService";
import {initializeDatabase} from "./config/database";
import {migrateFromFileToDatabase} from "./utils/migrate";
// Import models to ensure they are initialized before database sync
import "./models/sequelize/User";
import "./models/sequelize/Settings";
import "./models/sequelize/Repo";

const app = express();

// Middleware
app.use(cors());
app.use(loggerMiddleware);
app.use(rawBodyMiddleware);
app.use(jsonParserMiddleware);

// Git HTTP routes - Main format (/repository/:username/:repo/info/refs)
// This is the primary format for repository access
app.get("/repository/:username/:repo/info/refs", getInfoRefs);
app.post("/repository/:username/:repo/git-upload-pack", handleUploadPack);
app.post("/repository/:username/:repo/git-receive-pack", handleReceivePack);

// Git HTTP routes - Username-based format (/:username/:repo/info/refs) - for backward compatibility
app.get("/:username/:repo/info/refs", getInfoRefs);
app.post("/:username/:repo/git-upload-pack", handleUploadPack);
app.post("/:username/:repo/git-receive-pack", handleReceivePack);

// Git HTTP routes - Standard format (/:repo/info/refs) - for backward compatibility
// These must be before API routes to avoid conflicts
app.get("/:repo/info/refs", getInfoRefs);
app.post("/:repo/git-upload-pack", handleUploadPack);
app.post("/:repo/git-receive-pack", handleReceivePack);

// Git HTTP routes - API format (/api/repos/:username/:repo/info/refs) for consistency
app.get("/api/repos/:username/:repo/info/refs", getInfoRefs);
app.post("/api/repos/:username/:repo/git-upload-pack", handleUploadPack);
app.post("/api/repos/:username/:repo/git-receive-pack", handleReceivePack);

// Git HTTP routes - API format (/api/repos/:repo/info/refs) - for backward compatibility
app.get("/api/repos/:repo/info/refs", getInfoRefs);
app.post("/api/repos/:repo/git-upload-pack", handleUploadPack);
app.post("/api/repos/:repo/git-receive-pack", handleReceivePack);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// Health check endpoint
app.get("/api/check", (_req, res) => {
  res.send("Hello");
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Migrate existing data from JSON files to database
    await migrateFromFileToDatabase();
    
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
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
