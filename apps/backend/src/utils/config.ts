import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export const BASE_REPO_DIR = process.env.ROOT_DIR as string;
export const PORT = 4642;
export const SSH_PORT = parseInt(process.env.SSH_PORT || "2222", 10);

// Ensure base repo directory exists
if (!fs.existsSync(BASE_REPO_DIR)) {
  fs.mkdirSync(BASE_REPO_DIR, {recursive: true});
}

// Get user-specific repo directory (using username)
export const getUserRepoDir = (username: string): string => {
  const userRepoDir = path.join(BASE_REPO_DIR, username);
  if (!fs.existsSync(userRepoDir)) {
    fs.mkdirSync(userRepoDir, {recursive: true});
  }
  return userRepoDir;
};
