import {Request, Response} from "express";
import {GitHttpService} from "../services/GitHttpService";
import {AuthService} from "../services/AuthService";
import {ActivityService} from "../services/ActivityService";

const gitHttpService = new GitHttpService();
const authService = new AuthService();
const activityService = new ActivityService();

// Helper to extract username and repo from request

const isSingle = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

export const extractUsernameAndRepo = async (
  req: Request,
): Promise<{username: string; repo: string} | null> => {
  // /repository/:username/:repo
  if (
    req.path.startsWith("/repository/") &&
    isSingle(req.params.username) &&
    isSingle(req.params.repo)
  ) {
    return {
      username: req.params.username,
      repo: req.params.repo,
    };
  }

  // /:username/:repo
  if (isSingle(req.params.username) && isSingle(req.params.repo)) {
    return {
      username: req.params.username,
      repo: req.params.repo,
    };
  }

  // /:repo (username from JWT)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    if (decoded && isSingle(req.params.repo)) {
      const user = await authService.getUserById(decoded.userId);
      if (user) {
        return {
          username: user.username,
          repo: req.params.repo,
        };
      }
    }
  }

  // Git-style URLs:
  // /username/repo.git/info/refs
  // /username/repo.git/git-upload-pack
  const pathParts = req.path.split("/").filter(Boolean);

  if (pathParts.length >= 2) {
    const [username, repo] = pathParts;

    if (
      isSingle(username) &&
      isSingle(repo) &&
      ![
        "api",
        "repository",
        "info",
        "git-upload-pack",
        "git-receive-pack",
      ].includes(username) &&
      !repo.startsWith("info") &&
      !repo.startsWith("git-")
    ) {
      return {username, repo};
    }
  }

  return null;
};

export class GitHttpController {
  async getInfoRefs(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[GitHttp] getInfoRefs - path: ${req.path}, params:`,
        req.params,
      );

      const userAndRepo = await extractUsernameAndRepo(req);
      if (!userAndRepo) {
        console.log(
          `[GitHttp] Failed to extract username and repo from path: ${req.path}`,
        );
        res.status(404).send("Repository not found");
        return;
      }

      const {username, repo: repoName} = userAndRepo;
      const service = req.query.service as string;

      console.log(
        `[GitHttp] getInfoRefs: username=${username}, repo=${repoName}, service=${service}`,
      );

      if (service === "git-upload-pack" || service === "git-receive-pack") {
        const stdout = await gitHttpService.getInfoRefs(
          username,
          repoName,
          service,
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

      console.log("[GitHttp] handleUploadPack", {
        username,
        repoName,
        contentType: req.headers["content-type"],
        contentLength: req.headers["content-length"],
      });

      // IMPORTANT: get a spawned process (not exec) so we can stream
      const child = await gitHttpService.handleUploadPack(username, repoName);

      res.status(200);
      res.setHeader("Content-Type", "application/x-git-upload-pack-result");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Encoding", "identity");

      // Stream request -> git stdin, git stdout -> response
      req.pipe(child.stdin);
      child.stdout.pipe(res);

      child.stderr.on("data", (data: Buffer) => {
        console.error("git-upload-pack stderr:", data.toString("utf8"));
      });

      // If client disconnects, kill git
      res.on("close", () => {
        try {
          child.kill("SIGKILL");
        } catch {}
      });

      child.on("error", (error: Error) => {
        console.error("git-upload-pack process error:", error);
        if (!res.headersSent) res.status(500);
        res.end();
      });

      child.on("exit", (code: number | null) => {
        if (code !== 0)
          console.error(`git-upload-pack exited with code ${code}`);
        if (!res.writableEnded) res.end();
      });
    } catch (err: any) {
      console.error("POST git-upload-pack error:", err?.stack ?? err);
      if (!res.headersSent) {
        if (err.message === "Repository not found")
          res.status(404).send(err.message);
        else res.status(500).send(`Internal server error: ${err.message}`);
      } else {
        res.end();
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

      console.log("[GitHttp] handleReceivePack", {
        username,
        repoName,
        contentType: req.headers["content-type"],
        contentLength: req.headers["content-length"],
      });

      const child = await gitHttpService.handleReceivePack(username, repoName);

      res.status(200);
      res.setHeader("Content-Type", "application/x-git-receive-pack-result");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Encoding", "identity");

      // STREAM: request -> git stdin
      req.pipe(child.stdin);

      // STREAM: git stdout -> response
      child.stdout.pipe(res);

      // Log stderr (super important for push failures)
      child.stderr.on("data", (data: Buffer) => {
        console.error("git-receive-pack stderr:", data.toString("utf8"));
      });

      // Kill git if client disconnects
      res.on("close", () => {
        try {
          child.kill("SIGKILL");
        } catch {}
      });

      child.on("error", (error: Error) => {
        console.error("git-receive-pack process error:", error);
        if (!res.headersSent) res.status(500);
        res.end();
      });

      child.on("exit", async (code: number | null) => {
        if (code !== 0) {
          console.error(`git-receive-pack exited with code ${code}`);
        } else {
          // Push successful, record activity
          try {
            let userId: string | null = null;
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith("Basic ")) {
              const creds = Buffer.from(
                authHeader.substring(6),
                "base64",
              ).toString("utf8");
              const [u, p] = creds.split(":");
              try {
                // Try login
                const result = await authService.login({
                  username: u,
                  password: p,
                });
                userId = result.user.id;
              } catch (e) {
                // Login failed
                console.warn("Auth failed during activity logging for push", e);
              }
            }

            if (userId) {
              await activityService.createActivity(
                userId,
                "PUSH",
                `Pushed to ${username}/${repoName}`,
                `Pushed commits to repository ${username}/${repoName}`,
                `/repository/${username}/${repoName}`,
                {repo: repoName, username},
              );
            }
          } catch (err) {
            console.error("Error creating activity for push:", err);
          }
        }
        if (!res.writableEnded) res.end();
      });
    } catch (err: any) {
      console.error("POST git-receive-pack error:", err?.stack ?? err);
      if (!res.headersSent) {
        if (err.message === "Repository not found")
          res.status(404).send(err.message);
        else res.status(500).send(`Internal server error: ${err.message}`);
      } else {
        res.end();
      }
    }
  }
}
