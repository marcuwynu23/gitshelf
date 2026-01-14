import {Response} from "express";
import {AuthRequest} from "../middleware/auth";
import {RepoService} from "../services/RepoService";
import {GitService} from "../services/GitService";
import {getServerURL} from "../utils/serverUrl";

const repoService = new RepoService();
const gitService = new GitService();

export class RepoController {
  async listRepos(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const httpBaseURL = getServerURL(req);
      const repos = await repoService.listRepos(req.username, httpBaseURL);
      res.json(repos);
    } catch (err) {
      console.error("GET /api/repos error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async createRepo(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const {name, title, description} = req.body as {name: string; title?: string; description?: string};
      const repoName = await repoService.createRepo(req.username, name, title, description);
      res.json({message: "Repo created", name: repoName});
    } catch (err: any) {
      console.error("POST /api/repos error:", err);
      if (
        err.message === "Repo name required" ||
        err.message === "Repo exists"
      ) {
        res.status(400).json({error: err.message});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }

  async getRepoMetadata(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const repoName = req.params.name;
      const metadata = await repoService.getRepoMetadata(req.username, repoName);
      
      if (!metadata) {
        res.status(404).json({error: "Repo metadata not found"});
        return;
      }

      res.json(metadata);
    } catch (err) {
      console.error("GET /api/repos/:name/metadata error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async getRepoTree(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const repoName = req.params.name;

      if (!repoService.repoExists(req.username, repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const fileTree = await gitService.getFileTree(req.username, repoName);
      res.json(fileTree);
    } catch (err) {
      console.error("GET /api/repos/:name error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async deleteRepo(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const repoName = req.params.name;
      await repoService.deleteRepo(req.username, repoName);
      res.json({message: "Repo deleted successfully"});
    } catch (err: any) {
      console.error("DELETE /api/repos/:name error:", err);
      if (
        err.message === "Repo not found"
      ) {
        res.status(404).json({error: err.message});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }

  async archiveRepo(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.username) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const repoName = req.params.name;
      await repoService.archiveRepo(req.username, repoName);
      res.json({message: "Repo archived successfully"});
    } catch (err: any) {
      console.error("PATCH /api/repos/:name/archive error:", err);
      if (
        err.message === "Repo not found"
      ) {
        res.status(404).json({error: err.message});
      } else {
        res.status(500).json({error: "Internal server error"});
      }
    }
  }
}
