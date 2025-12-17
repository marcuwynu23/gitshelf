import {Request, Response} from "express";
import {RepoService} from "../services/RepoService";
import {GitService} from "../services/GitService";
import {getServerURL} from "../utils/serverUrl";

const repoService = new RepoService();
const gitService = new GitService();

export class RepoController {
  async listRepos(req: Request, res: Response): Promise<void> {
    try {
      const httpBaseURL = getServerURL(req);
      const repos = await repoService.listRepos(httpBaseURL);
      res.json(repos);
    } catch (err) {
      console.error("GET /api/repos error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }

  async createRepo(req: Request, res: Response): Promise<void> {
    try {
      const {name} = req.body as {name: string};
      const repoName = await repoService.createRepo(name);
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

  async getRepoTree(req: Request, res: Response): Promise<void> {
    try {
      const repoName = req.params.name;

      if (!repoService.repoExists(repoName)) {
        res.status(404).json({error: "Repo not found"});
        return;
      }

      const fileTree = await gitService.getFileTree(repoName);
      res.json(fileTree);
    } catch (err) {
      console.error("GET /api/repos/:name error:", err);
      res.status(500).json({error: "Internal server error"});
    }
  }
}
