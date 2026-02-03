import {Response} from "express";
import {AuthRequest} from "../middleware/auth";
import {GitService} from "../services/GitService";
import {RepoService} from "../services/RepoService";
import {isSingleParam} from "./helpers";

const gitService = new GitService();
const repoService = new RepoService();

export class CommitController {
  async getCommits(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const repoName = req.params.name;
      if (!isSingleParam(repoName)) {
        res.status(400).json({error: "Invalid repo name"});
        return;
      }
      if (!repoService.repoExists(req.username, repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const commits = await gitService.getCommits(req.username, repoName);
      res.json(commits);
    } catch (err) {
      console.error(`GET /api/repos/${req.params.name}/commits error:`, err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
