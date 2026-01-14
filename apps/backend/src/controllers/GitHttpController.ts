import {Request, Response} from "express";
import {GitHttpService} from "../services/GitHttpService";
import {AuthService} from "../services/AuthService";

const gitHttpService = new GitHttpService();
const authService = new AuthService();

// Helper to extract username and repo from request
const extractUsernameAndRepo = async (
  req: Request
): Promise<{username: string; repo: string} | null> => {
  // Handle /repository/:username/:repo format - both username and repo are in path params
  if (req.path.startsWith('/repository/') && req.params.username && req.params.repo) {
    return {
      username: req.params.username,
      repo: req.params.repo,
    };
  }

  // First, try to get username from path parameter (for username-based routes like /:username/:repo)
  if (req.params.username && req.params.repo) {
    return {
      username: req.params.username,
      repo: req.params.repo,
    };
  }

  // If no username in path, try to get from JWT token (for routes like /:repo)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    if (decoded) {
      // Get user to retrieve username
      const user = await authService.getUserById(decoded.userId);
      if (user && req.params.repo) {
        return {
          username: user.username,
          repo: req.params.repo,
        };
      }
    }
  }

  // Fallback: Parse from URL path
  // Git requests come as: /username/repo.git/info/refs or /username/repo.git/git-upload-pack
  const pathParts = req.path.split("/").filter(Boolean);

  // Check if we have at least username and repo in the path
  if (pathParts.length >= 2) {
    const firstPart = pathParts[0];
    const secondPart = pathParts[1];

    // Check if first part looks like a username (not a Git endpoint)
    if (
      firstPart !== "api" &&
      firstPart !== "repository" &&
      firstPart !== "info" &&
      firstPart !== "git-upload-pack" &&
      firstPart !== "git-receive-pack" &&
      secondPart &&
      !secondPart.startsWith("info") &&
      !secondPart.startsWith("git-")
    ) {
      // Format: /username/repo.git/info/refs or /username/repo.git/git-upload-pack
      return {
        username: firstPart,
        repo: secondPart,
      };
    }
  }

  return null;
};

export class GitHttpController {
  async getInfoRefs(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[GitHttp] getInfoRefs - path: ${req.path}, params:`, req.params);
      
      const userAndRepo = await extractUsernameAndRepo(req);
      if (!userAndRepo) {
        console.log(`[GitHttp] Failed to extract username and repo from path: ${req.path}`);
        res.status(404).send("Repository not found");
        return;
      }

      const {username, repo: repoName} = userAndRepo;
      const service = req.query.service as string;

      console.log(
        `[GitHttp] getInfoRefs: username=${username}, repo=${repoName}, service=${service}`
      );

      if (service === "git-upload-pack" || service === "git-receive-pack") {
        const stdout = await gitHttpService.getInfoRefs(
          username,
          repoName,
          service
        );

        res.setHeader("Content-Type", `application/x-${service}-advertisement`);
        res.setHeader("Cache-Control", "no-cache");

        // Git protocol requires a pkt-line format
        const serviceLine = `# service=${service}\n`;
        const length = (serviceLine.length + 4).toString(16).padStart(4, "0");
        res.write(length + serviceLine);
        res.write("0000"); // flush packet
        res.write(stdout);
        res.end();
      } else {
        const refs = await gitHttpService.getInfoRefs(username, repoName, "");
        res.setHeader("Content-Type", "text/plain");
        res.send(refs);
      }
    } catch (err: any) {
      console.error("GET /:repo/info/refs error:", err);
      console.error("Error details:", err.stack);
      if (err.message === "Repository not found") {
        res.status(404).send(err.message);
      } else {
        res.status(500).send(`Internal server error: ${err.message}`);
      }
    }
  }

  async handleUploadPack(req: Request, res: Response): Promise<void> {
    try {
      const userAndRepo = await extractUsernameAndRepo(req);
      if (!userAndRepo) {
        res.status(404).send("Repository not found");
        return;
      }

      const {username, repo: repoName} = userAndRepo;
      const rawBody = (req as any).rawBody as Buffer;

      console.log(
        `[GitHttp] handleUploadPack: username=${username}, repo=${repoName}, bodySize=${
          rawBody?.length || 0
        }`
      );

      const childProcess = await gitHttpService.handleUploadPack(
        username,
        repoName,
        rawBody
      );

      res.setHeader("Content-Type", "application/x-git-upload-pack-result");
      res.setHeader("Cache-Control", "no-cache");

      if (childProcess.stdin) {
        childProcess.stdin.write(rawBody);
        childProcess.stdin.end();
      }

      if (childProcess.stdout) {
        childProcess.stdout.pipe(res);
      }

      // Handle stderr
      if (childProcess.stderr) {
        childProcess.stderr.on("data", (data: Buffer) => {
          console.error("git-upload-pack stderr:", data.toString());
        });
      }

      childProcess.on("error", (error: Error) => {
        console.error("git-upload-pack process error:", error);
        if (!res.headersSent) {
          res.status(500).send(`Internal server error: ${error.message}`);
        }
      });

      childProcess.on("exit", (code: number | null) => {
        if (code !== 0 && !res.headersSent) {
          console.error(`git-upload-pack exited with code ${code}`);
          res.status(500).send("Git process failed");
        }
      });
    } catch (err: any) {
      console.error("POST /:repo/git-upload-pack error:", err);
      console.error("Error details:", err.stack);
      if (!res.headersSent) {
        if (err.message === "Repository not found") {
          res.status(404).send(err.message);
        } else if (err.message === "Request body required") {
          res.status(400).send(err.message);
        } else {
          res.status(500).send(`Internal server error: ${err.message}`);
        }
      }
    }
  }

  async handleReceivePack(req: Request, res: Response): Promise<void> {
    try {
      const userAndRepo = await extractUsernameAndRepo(req);
      if (!userAndRepo) {
        res.status(404).send("Repository not found");
        return;
      }

      const {username, repo: repoName} = userAndRepo;
      const rawBody = (req as any).rawBody as Buffer;

      const childProcess = await gitHttpService.handleReceivePack(
        username,
        repoName,
        rawBody
      );

      res.setHeader("Content-Type", "application/x-git-receive-pack-result");
      res.setHeader("Cache-Control", "no-cache");

      if (childProcess.stdin) {
        childProcess.stdin.write(rawBody);
        childProcess.stdin.end();
      }

      if (childProcess.stdout) {
        childProcess.stdout.pipe(res);
      }

      childProcess.on("error", (error: Error) => {
        console.error("git-receive-pack process error:", error);
        if (!res.headersSent) {
          res.status(500).send("Internal server error");
        }
      });
    } catch (err: any) {
      console.error("POST /:repo/git-receive-pack error:", err);
      if (!res.headersSent) {
        if (err.message === "Repository not found") {
          res.status(404).send(err.message);
        } else if (err.message === "Request body required") {
          res.status(400).send(err.message);
        } else {
          res.status(500).send("Internal server error");
        }
      }
    }
  }
}
