import {Request, Response} from "express";
import {GitHttpService} from "../services/GitHttpService";

const gitHttpService = new GitHttpService();

export class GitHttpController {
  async getInfoRefs(req: Request, res: Response): Promise<void> {
    try {
      const repoName = req.params.repo;
      const service = req.query.service as string;

      console.log(
        `[GitHttp] getInfoRefs: repo=${repoName}, service=${service}`
      );

      if (service === "git-upload-pack" || service === "git-receive-pack") {
        const stdout = await gitHttpService.getInfoRefs(repoName, service);

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
        const refs = await gitHttpService.getInfoRefs(repoName, "");
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
      const repoName = req.params.repo;
      const rawBody = (req as any).rawBody as Buffer;

      console.log(
        `[GitHttp] handleUploadPack: repo=${repoName}, bodySize=${
          rawBody?.length || 0
        }`
      );

      const childProcess = await gitHttpService.handleUploadPack(
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
      const repoName = req.params.repo;
      const rawBody = (req as any).rawBody as Buffer;

      const childProcess = await gitHttpService.handleReceivePack(
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
