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

  async createBranch(req: AuthRequest, res: Response): Promise<void> {
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

      const {newBranch, sourceBranch} = req.body as {
        newBranch?: string;
        sourceBranch?: string;
      };

      if (!newBranch || !newBranch.trim()) {
        res.status(400).json({error: "newBranch is required"});
        return;
      }

      if (!sourceBranch || !sourceBranch.trim()) {
        res.status(400).json({error: "sourceBranch is required"});
        return;
      }

      await gitService.createBranch(
        req.username,
        repoName,
        newBranch.trim(),
        sourceBranch.trim(),
      );

      res
        .status(201)
        .json({message: "Branch created", branch: newBranch.trim()});
    } catch (err: any) {
      console.error("POST /api/repos/:name/branches error:", err);
      if (
        err?.message?.includes("not a valid object name") ||
        err?.message?.includes("not a valid ref")
      ) {
        res.status(400).json({error: "Invalid source branch"});
      } else if (err?.message?.includes("already exists")) {
        res.status(409).json({error: "Branch already exists"});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }

  async deleteBranch(req: AuthRequest, res: Response): Promise<void> {
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

      const branchName = req.params.branch;
      if (!isSingleParam(branchName) || !branchName.trim()) {
        res.status(400).json({error: "Invalid branch name"});
        return;
      }

      // Prevent deleting the current/default branch
      const currentBranch = await gitService.getCurrentBranch(
        req.username,
        repoName,
      );
      if (branchName.trim() === currentBranch) {
        res.status(400).json({error: "Cannot delete the default branch"});
        return;
      }

      await gitService.deleteBranch(req.username, repoName, branchName.trim());
      res.json({message: "Branch deleted", branch: branchName.trim()});
    } catch (err: any) {
      console.error("DELETE /api/repos/:name/branches/:branch error:", err);
      if (err?.message?.includes("not found")) {
        res.status(404).json({error: "Branch not found"});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }

  async setDefaultBranch(req: AuthRequest, res: Response): Promise<void> {
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

      const {branch} = req.body as {branch?: string};
      if (!branch || !branch.trim()) {
        res.status(400).json({error: "branch is required"});
        return;
      }

      await gitService.setDefaultBranch(req.username, repoName, branch.trim());
      res.json({message: "Default branch updated", branch: branch.trim()});
    } catch (err: any) {
      console.error("PUT /api/repos/:name/default-branch error:", err);
      if (
        err?.message?.includes("not a valid object name") ||
        err?.message?.includes("not a valid ref")
      ) {
        res.status(400).json({error: "Branch does not exist"});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }
}
