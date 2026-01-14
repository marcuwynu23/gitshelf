import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "database.sqlite");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false, // Set to console.log to see SQL queries
});

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    
    // Sync all models - create tables if they don't exist
    await sequelize.sync();
    console.log("Database models synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

