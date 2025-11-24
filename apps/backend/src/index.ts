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

// --- FileNode interface ---
export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string; // relative path from repo root
  content?: string; // only for files
  children?: FileNode[]; // only for folders
}

// --- Helper: recursively list files with content ---
const listFilesWithContent = (dirPath: string, basePath = ""): FileNode[] => {
  return fs.readdirSync(dirPath).map((name) => {
    const fullPath = path.join(dirPath, name);
    const relativePath = path.join(basePath, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      return {
        name,
        type: "folder",
        path: relativePath,
        children: listFilesWithContent(fullPath, relativePath),
      };
    } else {
      return {
        name,
        type: "file",
        path: relativePath,
        content: fs.readFileSync(fullPath, "utf-8"), // read actual content
      };
    }
  });
};

// --- Create a new repository ---
app.post("/api/repos", async (req: Request, res: Response) => {
  try {
    const {name} = req.body as {name: string};
    if (!name) return res.status(400).json({error: "Repo name required"});

    const repoNameWithGit = `${name}.git`;
    const repoPath = path.join(REPO_DIR, repoNameWithGit);

    if (fs.existsSync(repoPath))
      return res.status(400).json({error: "Repo exists"});

    fs.mkdirSync(repoPath, {recursive: true});
    const git: SimpleGit = simpleGit(repoPath);
    await git.init(true); // bare repo

    res.json({message: "Repo created", name: repoNameWithGit});
  } catch (err) {
    console.error("POST /api/repos error:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- List all repositories ---
app.get("/api/repos", (_req: Request, res: Response) => {
  try {
    const serveType = process.env.GIT_SERVE_TYPE || "ssh";
    const reposBasePathSSH = process.env.GIT_SERVE_REPOS_PATH;
    const reposBaseURL = process.env.GIT_SERVE_DOMAIN;

    const repos = fs
      .readdirSync(REPO_DIR)
      .filter((f) => fs.statSync(path.join(REPO_DIR, f)).isDirectory())
      .map((repo) => ({
        name: repo,
        sshAddress: reposBasePathSSH ? `${reposBasePathSSH}${repo}` : null,
        httpAddress: reposBaseURL ? `${reposBaseURL}/${repo}` : null,
      }));

    res.json(repos);
  } catch (err) {
    console.error("GET /api/repos error:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

app.get("/api/repos/:name", async (req: Request, res: Response) => {
  try {
    const repoName = req.params.name;
    const repoPath = path.join(REPO_DIR, repoName);

    if (!fs.existsSync(repoPath))
      return res.status(404).json({error: "Repo not found"});

    const git = simpleGit(repoPath);

    // Check if repo has commits
    const log = await git.log({maxCount: 1});
    if (log.total === 0) return res.json([]); // no commits

    // Get all files in the latest commit
    const treeRaw = await git.raw(["ls-tree", "-r", "--name-only", "HEAD"]);
    const allPaths = treeRaw.split("\n").filter(Boolean);

    type TreeNode = {
      name: string;
      path: string;
      type: "file" | "folder";
      children?: TreeNode[];
    };

    const root: TreeNode[] = [];

    const findOrCreateFolder = (
      nodes: TreeNode[],
      name: string,
      fullPath: string
    ) => {
      let node = nodes.find((n) => n.name === name && n.type === "folder");
      if (!node) {
        node = {name, path: fullPath, type: "folder", children: []};
        nodes.push(node);
      }
      return node;
    };

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1; // folders first
      });
    };

    allPaths.forEach((filePath) => {
      const parts = filePath.split("/");
      let currentLevel = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const fullPath = parts.slice(0, index + 1).join("/");

        if (isFile) {
          // Add file
          currentLevel.push({name: part, path: fullPath, type: "file"});
        } else {
          // Add or get folder
          const folderNode = findOrCreateFolder(currentLevel, part, fullPath);
          currentLevel = folderNode.children!;
        }

        // Sort current level so folders come first
        sortNodes(currentLevel);
      });
    });

    // Sort root as well
    sortNodes(root);

    res.json(root);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});

// Get file content from bare repository
app.get("/api/repos/:name/files", async (req: Request, res: Response) => {
  try {
    const repoName = req.params.name;
    const filePath = req.query.filePath as string;

    if (!filePath) return res.status(400).json({error: "filePath required"});

    const repoPath = path.join(REPO_DIR, repoName);
    const git = simpleGit(repoPath);

    // Get latest commit hash
    const log = await git.log({n: 1});
    if (log.total === 0)
      return res.status(404).json({error: "No commits found"});
    const latestCommit = log.latest?.hash;

    // Use 'git show' to get file content from the commit
    // git show <commit>:<filePath>
    const content = await git.show([`${latestCommit}:${filePath}`]);

    res.json({path: filePath, content});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- Get current branch of a repo ---
app.get(
  "/api/repos/:name/current-branch",
  async (req: Request, res: Response) => {
    try {
      const repoPath = path.join(REPO_DIR, req.params.name);
      if (!fs.existsSync(repoPath))
        return res.status(404).json({error: "Repo not found"});

      const git = simpleGit(repoPath);
      const branchSummary = await git.branch();
      res.json({current: branchSummary.current});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: "Internal server error"});
    }
  }
);

// --- List all branches ---
app.get("/api/repos/:name/branches", async (req: Request, res: Response) => {
  try {
    const repoPath = path.join(REPO_DIR, req.params.name);
    if (!fs.existsSync(repoPath))
      return res.status(404).json({error: "Repo not found"});

    const git = simpleGit(repoPath);
    const branchSummary = await git.branch();
    res.json({
      current: branchSummary.current,
      branches: branchSummary.all,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- Get commits of a repo ---
app.get("/api/repos/:name/commits", async (req: Request, res: Response) => {
  try {
    const repoPath = path.join(REPO_DIR, req.params.name);
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
      if (err?.message.includes("does not have any commits yet")) {
        commits = [];
      } else {
        throw err;
      }
    }

    res.json(commits);
  } catch (err) {
    console.error(`GET /api/repos/${req.params.name}/commits error:`, err);
    res.status(500).json({error: "Internal server error"});
  }
});

// --- Simple test endpoint ---
app.get("/api/check", (_req: Request, res: Response) => {
  res.send("Hello");
});

// --- Listen ---
const PORT = 4642;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Git API running on port ${PORT}...`)
);
