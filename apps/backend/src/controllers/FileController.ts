import {Request, Response} from "express";
import {GitService} from "../services/GitService";
import {RepoService} from "../services/RepoService";

const gitService = new GitService();
const repoService = new RepoService();

export class FileController {
  async getFileContent(req: Request, res: Response): Promise<void> {
    try {
      const repoName = req.params.name;
      const filePath = req.query.filePath as string;

      if (!filePath) {
        res.status(400).json({error: "filePath required"});
        return;
      }

      if (!repoService.repoExists(repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const content = await gitService.getFileContent(repoName, filePath);
      res.json({path: filePath, content});
    } catch (err: any) {
      console.error("GET /api/repos/:name/files error:", err);
      if (err.message === "No commits found") {
        res.status(404).json({error: err.message});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }
}

