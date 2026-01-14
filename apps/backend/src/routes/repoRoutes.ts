import {Router} from "express";
import {RepoController} from "../controllers/RepoController";
import {FileController} from "../controllers/FileController";
import {BranchController} from "../controllers/BranchController";
import {CommitController} from "../controllers/CommitController";
import {authMiddleware} from "../middleware/auth";

const router = Router();
const repoController = new RepoController();
const fileController = new FileController();
const branchController = new BranchController();
const commitController = new CommitController();

// All repo routes require authentication
router.use(authMiddleware);

// Repository routes
router.get("/", (req, res) => repoController.listRepos(req, res));
router.post("/", (req, res) => repoController.createRepo(req, res));
router.get("/:name/metadata", (req, res) => repoController.getRepoMetadata(req, res));
router.put("/:name/metadata", (req, res) => repoController.updateRepoMetadata(req, res));
router.patch("/:name/rename", (req, res) => repoController.renameRepo(req, res));
router.get("/:name", (req, res) => repoController.getRepoTree(req, res));
router.delete("/:name", (req, res) => repoController.deleteRepo(req, res));
router.patch("/:name/archive", (req, res) => repoController.archiveRepo(req, res));

// File routes
router.get("/:name/files", (req, res) =>
  fileController.getFileContent(req, res)
);

// Branch routes
router.get("/:name/branches", (req, res) =>
  branchController.getBranches(req, res)
);
router.get("/:name/current-branch", (req, res) =>
  branchController.getCurrentBranch(req, res)
);

// Commit routes
router.get("/:name/commits", (req, res) =>
  commitController.getCommits(req, res)
);

export default router;
