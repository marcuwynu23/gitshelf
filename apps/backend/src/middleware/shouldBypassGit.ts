import type {Request} from "express";

const GIT_SUFFIXES = ["/info/refs", "/git-upload-pack", "/git-receive-pack"];

export function shouldBypassGit(req: Request): boolean {
  const p = req.path;
  if (!p) return false;
  return GIT_SUFFIXES.some((s) => p.endsWith(s));
}
