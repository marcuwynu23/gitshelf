/// <reference types="jest" />

import {shouldBypassGit} from "@backend/middleware/shouldBypassGit";
import express from "express";
import request from "supertest";

describe("shouldBypassGit", () => {
  test.each([
    ["/repository/u/r.git/info/refs", true],
    ["/repository/u/r.git/git-upload-pack", true],
    ["/repository/u/r.git/git-receive-pack", true],
    ["/api/check", false],
    ["/api/repos/x", false],
  ])("path %s => %s", (p, expected) => {
    const req = {path: p} as any;
    expect(shouldBypassGit(req)).toBe(expected);
  });
});

describe("middleware bypass integration", () => {
  test("raw/json-like middleware is bypassed for git-upload-pack", async () => {
    const app = express();

    const hits: string[] = [];

    // Simulate your rawBodyMiddleware/jsonParserMiddleware
    app.use((req, _res, next) => {
      if (shouldBypassGit(req)) return next();
      hits.push("raw-or-json");
      // Simulate consuming body (worst-case)
      req.on("data", () => {});
      req.on("end", () => next());
    });

    app.post("/repository/:username/:repo/git-upload-pack", (req, res) => {
      // If middleware consumed body, we'd see 0 bytes.
      let size = 0;
      req.on("data", (d) => (size += d.length));
      req.on("end", () => res.json({size}));
    });

    const payload = Buffer.from("0010test-payload", "utf8");

    const r = await request(app)
      .post("/repository/u/r.git/git-upload-pack")
      .set("Content-Type", "application/x-git-upload-pack-request")
      .send(payload);

    expect(r.status).toBe(200);
    expect(r.body.size).toBe(payload.length);
    expect(hits).toEqual([]); // ✅ bypassed
  });
});
