import express, {Request, Response, NextFunction} from "express";

export const jsonParserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip JSON parsing for Git HTTP protocol routes
  if (
    req.path.includes("/git-upload-pack") ||
    req.path.includes("/git-receive-pack") ||
    req.path.includes("/info/refs")
  ) {
    next();
  } else if (req.path.startsWith("/api/")) {
    express.json()(req, res, next);
  } else {
    next();
  }
};
