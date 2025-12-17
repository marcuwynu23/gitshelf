import {Request, Response} from "express";
import {GitService} from "../services/GitService";
import {RepoService} from "../services/RepoService";

const gitService = new GitService();
const repoService = new RepoService();

export class CommitController {
  async getCommits(req: Request, res: Response): Promise<void> {
    try {
      const repoName = req.params.name;

      if (!repoService.repoExists(repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const commits = await gitService.getCommits(repoName);
      res.json(commits);
    } catch (err) {
      console.error(`GET /api/repos/${req.params.name}/commits error:`, err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
