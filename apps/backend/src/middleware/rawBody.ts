import {Request, Response, NextFunction} from "express";

export const rawBodyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.path.includes("/git-upload-pack") ||
    req.path.includes("/git-receive-pack")
  ) {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      (req as any).rawBody = Buffer.concat(chunks);
      next();
    });
  } else {
    next();
  }
};
