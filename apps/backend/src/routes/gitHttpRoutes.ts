import {Request, Response} from "express";
import {GitHttpController} from "../controllers/GitHttpController";

const gitHttpController = new GitHttpController();

// Export route handlers directly (will be mounted in index.ts)
export const getInfoRefs = (req: Request, res: Response) =>
  gitHttpController.getInfoRefs(req, res);

export const handleUploadPack = (req: Request, res: Response) =>
  gitHttpController.handleUploadPack(req, res);

export const handleReceivePack = (req: Request, res: Response) =>
  gitHttpController.handleReceivePack(req, res);
