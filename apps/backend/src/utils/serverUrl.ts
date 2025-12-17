import {Request} from "express";
import {PORT} from "./config";

export const getServerURL = (req: Request): string => {
  // Check for X-Forwarded-Proto header (when behind proxy/load balancer)
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  const host =
    req.get("x-forwarded-host") || req.get("host") || `localhost:${PORT}`;
  return `${protocol}://${host}`;
};
