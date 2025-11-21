import express, {Request, Response, NextFunction} from "express";
import simpleGit, {SimpleGit} from "simple-git";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Log all requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const REPO_DIR = process.env.ROOT_DIR as string;
if (!fs.existsSync(REPO_DIR)) fs.mkdirSync(REPO_DIR, {recursive: true});

// FileNode interface
export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

// Helper: recursively list files as FileNode[]
const listFiles = (dirPath: string): FileNode[] => {
  return fs.readdirSync(dirPath).map((name) => {
    const fullPath = path.join(dirPath, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      return {
        name,
        type: "folder",
        children: listFiles(fullPath), // recursive
      };
    } else {
      return {
        name,
        type: "file",
      };
    }
  });
};

// Create a new repository
app.post("/api/repos", async (req: Request, res: Response) => {
  try {
    const {name} = req.body as {name: string};
    if (!name) return res.status(400).json({error: "Repo name required"});

    const repoPath = path.join(REPO_DIR, name);
    if (fs.existsSync(repoPath))
      return res.status(400).json({error: "Repo exists"});

    fs.mkdirSync(repoPath, {recursive: true});
    const git: SimpleGit = simpleGit(repoPath);
    await git.init();

    res.json({message: "Repo created", name});
  } catch (err) {
    console.error("POST /api/repos error:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

// List all repositories
app.get("/api/repos", (_req: Request, res: Response) => {
  try {
    const repos = fs
      .readdirSync(REPO_DIR)
      .filter((f) => fs.statSync(path.join(REPO_DIR, f)).isDirectory());
    res.json(repos);
  } catch (err) {
    console.error("GET /api/repos error:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

// Get file tree of a repo (recursive)
app.get("/api/repos/:name", (req: Request, res: Response) => {
  try {
    const repoPath = path.join(REPO_DIR, req.params.name);
    if (!fs.existsSync(repoPath))
      return res.status(404).json({error: "Repo not found"});

    const files = listFiles(repoPath);
    res.json(files); // returns FileNode[]
  } catch (err) {
    console.error(`GET /api/repos/${req.params.name} error:`, err);
    res.status(500).json({error: "Internal server error"});
  }
});
// Get commits of a repo
// Get commits of a repo
app.get("/api/repos/:name/commits", async (req: Request, res: Response) => {
  try {
    const repoName = req.params.name;
    const repoPath = path.join(REPO_DIR, repoName);

    if (!fs.existsSync(repoPath))
      return res.status(404).json({error: "Repo not found"});

    const git: SimpleGit = simpleGit(repoPath);

    let commits: {
      hash: string;
      message: string;
      author: string;
      date: string;
    }[] = [];

    try {
      const log = await git.log({maxCount: 20});
      commits = log.all.map((c) => ({
        hash: c.hash,
        message: c.message,
        author: c.author_name,
        date: c.date,
      }));
    } catch (err: any) {
      // If there are no commits yet, git.log() throws a GitError
      if (err?.message.includes("does not have any commits yet")) {
        commits = []; // simply return empty array
      } else {
        throw err; // rethrow other errors
      }
    }

    res.json(commits);
  } catch (err) {
    console.error(`GET /api/repos/${req.params.name}/commits error:`, err);
    res.status(500).json({error: "Internal server error"});
  }
});

// Simple test endpoint
app.get("/api/check", (_req: Request, res: Response) => {
  res.send("Hello");
});

// Listen
const PORT = 4642;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Git API running on port ${PORT}...`)
);
