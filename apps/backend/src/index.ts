import { createServer } from "http";
import {PORT, SSH_PORT} from "./utils/config";
import {SshServerService} from "./services/SshServerService";
import {initializeDatabase} from "./config/database";
import {migrateFromFileToDatabase} from "./utils/migrate";
import "./models/sequelize/User";
import "./models/sequelize/Settings";
import "./models/sequelize/Repo";
import "./models/sequelize/Activity"; // Register Activity model
import {createApp} from "./app";
import { SocketService } from "./services/SocketService";

async function startServer() {
  try {
    await initializeDatabase();
    await migrateFromFileToDatabase();

    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const socketService = SocketService.getInstance();
    // In production, you should restrict this to your frontend URL
    const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173", "http://127.0.0.1:5173"];
    socketService.initialize(httpServer, corsOrigins);

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Git API running on port ${PORT}...`);
    });

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
