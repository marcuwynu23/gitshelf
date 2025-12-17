import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const REPO_DIR = process.env.ROOT_DIR as string;
export const PORT = 4642;
export const SSH_PORT = parseInt(process.env.SSH_PORT || "2222", 10);

// Ensure repo directory exists
if (!fs.existsSync(REPO_DIR)) {
  fs.mkdirSync(REPO_DIR, {recursive: true});
}
