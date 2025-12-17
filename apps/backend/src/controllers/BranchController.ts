import {Request, Response} from "express";
import {GitService} from "../services/GitService";
import {RepoService} from "../services/RepoService";

const gitService = new GitService();
const repoService = new RepoService();

export class BranchController {
  async getBranches(req: Request, res: Response): Promise<void> {
    try {
      const repoName = req.params.name;

      if (!repoService.repoExists(repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const branchInfo = await gitService.getBranches(repoName);
      res.json(branchInfo);
    } catch (err) {
      console.error("GET /api/repos/:name/branches error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async getCurrentBranch(req: Request, res: Response): Promise<void> {
    try {
      const repoName = req.params.name;

      if (!repoService.repoExists(repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const currentBranch = await gitService.getCurrentBranch(repoName);
      res.json({current: currentBranch});
    } catch (err) {
      console.error("GET /api/repos/:name/current-branch error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
