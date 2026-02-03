import {Response} from "express";
import {AuthRequest} from "../middleware/auth";
import {GitService} from "../services/GitService";
import {RepoService} from "../services/RepoService";

const gitService = new GitService();
const repoService = new RepoService();

function isSingleParam(param: string | string[] | undefined): param is string {
  return typeof param === "string";
}

export class BranchController {
  async getBranches(req: AuthRequest, res: Response): Promise<void> {
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

      const branchInfo = await gitService.getBranches(req.username, repoName);
      res.json(branchInfo);
    } catch (err) {
      console.error("GET /api/repos/:name/branches error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async getCurrentBranch(req: AuthRequest, res: Response): Promise<void> {
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

      const currentBranch = await gitService.getCurrentBranch(
        req.username,
        repoName,
      );
      res.json({current: currentBranch});
    } catch (err) {
      console.error("GET /api/repos/:name/current-branch error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
