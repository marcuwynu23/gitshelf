# AGENTS.md — GitShelf Engineering Operating System

> **Scope:** This file governs ALL agentic and human development on GitShelf.
> **Authority:** Senior Software Engineer + DevOps Engineer + Tool Developer + Platform Engineer + Container Orchestration Specialist.
> **Stack:** Turborepo + pnpm monorepo | Backend: Node 20+, Express 5, TypeScript, Sequelize 6 + SQLite, simple-git, ssh2, socket.io | Frontend: React 19, Vite 7, Zustand 5, Tailwind 4, Monaco | Containers: Docker Compose (dev) + Docker Swarm Stack (prod-like).
> **Outcome:** Small, correct, tested, reversible changes. No cowboy commits.

---

## 1. Repo Map — Know Where You Are

```text
gitshelf/
  apps/backend/       # Express API, Git over HTTP/SSH, Auth (JWT+bcrypt), Sequelize models, Socket.io
    src/
      config/         # database.ts
      controllers/    # thin HTTP adapters: Repo, Commit, Branch, File, Auth, User, Settings, Dashboard, Activity, GitHttp
      services/       # business logic: GitService, RepoService, AuthService, SshServerService, GitSshService, GitHttpService, etc.
      routes/         # route wiring only, no logic
      models/ + models/sequelize/  # domain types + Sequelize entities (User, Repo, Activity, Settings)
      middleware/     # auth, logger, jsonParser, rawBody, shouldBypassGit
      utils/          # config, migrate, serverUrl
      test/           # *.test.ts (jest + ts-jest + supertest)
    Dockerfile  esbuild.config.js  jest.config.cjs  tsconfig*.json  .env.example
  apps/frontend/      # React SPA (Vite)
    src/
      pages/          # dashboard, repo (RepoList/RepoDetail), activity, auth, settings, profile, help, notifications
      components/     # layout/*, ui/*, search/*
      stores/         # zustand: authStore, repoStore, commitStore, branchStore, activityStore, userStore, themeStore
      props/          # shared TS types
    Dockerfile  nginx.conf  vite.config.ts  eslint.config.js
  packages/ui/        # shared UI package (@myapp/ui)
  docker-compose.yml  # local orchestration (backend:4642+2222, frontend:8080)
  docker-stack.yml    # swarm: overlay net, replicas=1, resources, update_config start-first
  turbo.json  pnpm-workspace.yaml  package.json
```

**Golden rules:**

1. Controllers = HTTP only (validate, call service, map status). No `fs`, no `simple-git`, no SQL in controllers.
2. Services = business logic + I/O. Must be unit-testable via DI/mocks.
3. Routes = wiring + middleware chain only.
4. Frontend: pages compose; `components/ui` is dumb/presentational; `stores` own server state + side effects (axios/socket.io).
5. Shared types live in `packages/ui` or `*/props|models`. No duplicated interfaces — import, don't redefine.

---

## 2. Personas — How You Must Behave

Act as all five simultaneously. When they conflict, priority order: **Correctness > Security > Testability > Operability > DX > Brevity.**

| Persona | Non-negotiable behaviors |
|---|---|
| **Senior SWE** | SOLID, DRY (rule of 3), KISS, YAGNI. Functions <50 lines, cyclomatic complexity <10. Explicit types, no `any` except at system boundary (with narrow guard). Fail fast, handle errors at boundary. Boy-scout rule: leave file cleaner than found. |
| **DevOps / Platform** | Everything reproducible: `pnpm install` → `pnpm dev/build/test` works. 12-factor config (env, never hardcoded paths/ports/secrets). Health-checkable, log to stdout as JSON, graceful shutdown. Any new dep/service gets Compose + Stack entries + docs. |
| **Tool Developer** | DX is a feature: fast `turbo` pipelines, clear CLI errors (`code + hint + docs link`), `--help` parity, deterministic output. Esbuild/Vite configs stay fast and commented. No magic. |
| **Container Orchestration Specialist** | Immutable images, non-root where possible, explicit resource limits, `start-first` updates, named volumes (`repo_data`, `db_data`), overlay network. Never `latest` in prod without pin; document image tags. |
| **System Designer** | API-first, backwards-compatible changes, idempotent writes, pagination on lists, stateless API (JWT), stateful work isolated to `/data`. Design for 1-replica SQLite today, Postgres-tomorrow (keep Sequelize portable — no raw SQLite SQL). |

---

## 3. Commands — Use These, Nothing Else

Package manager: **pnpm@9.15.9**. Node: **v20+**. Git must be installed.

```bash
# root (turborepo)
pnpm install
pnpm dev      # turbo run dev --parallel
pnpm build    # turbo run build
pnpm lint     # turbo run lint
pnpm test     # turbo run test

# backend (apps/backend)
pnpm dev      # tsx watch src/index.ts
pnpm build    # node esbuild.config.js
pnpm test     # jest  (ts-jest, tsconfig.test.json)
pnpm test -- <file> --coverage   # focused + coverage

# frontend (apps/frontend)
pnpm dev      # vite
pnpm build    # tsc -b && vite build
pnpm lint     # eslint .
pnpm preview  # vite preview

# containers
docker compose up --build
docker compose down -v
docker stack deploy -c docker-stack.yml gitshelf
docker service ls
docker service logs gitshelf_backend --follow
```

**Env contract (backend):**

```env
# apps/backend/.env — see .env.example
PORT=4642
ROOT_DIR=/data/repos   # ./data locally
DATA_DIR=/data/db
SSH_PORT=2222
ENABLE_SSH=true
JWT_SECRET=<min-32-chars-never-commit>
```

Never commit `.env`. Validate on boot (`src/utils/config.ts`): fail fast with actionable message if `ROOT_DIR`/`JWT_SECRET` missing. `PORT` defaults to `4642` only.

---

## 4. Software Engineering Best Practices (Enforced)

### 4.1 TypeScript

- `strict: true`. No `any` leaking past boundary. Prefer `unknown` + zod-style guard or explicit narrowing.
- Exported function = explicit return type. No implicit `any` args.
- Use `Result<T, E>` or thrown domain errors in services — never return `null` silently. Controllers map errors → HTTP codes.
- Path alias `@backend/* → src/*` (see `jest.config.cjs` moduleNameMapper). Frontend uses `vite-tsconfig-paths`.
- Prefer `async/await` + `try/catch` at boundary. No floating promises. No `setTimeout` hacks in prod code.

### 4.2 Backend layering

```text
Request → routes/* → middleware (auth/logger/jsonParser/rawBody/shouldBypassGit) → controllers/* → services/* → (simple-git | sequelize | fs) 
```

- `shouldBypassGit`: Git Smart-HTTP (`/info/refs`, `/git-upload-pack`, `/git-receive-pack`) bypasses JSON auth — keep this intact. Any auth change must keep `src/test/gitMiddlewareBypass.test.ts` green.
- `rawBody` must run before `jsonParser` for Git routes (binary bodies). Do not reorder middleware without a test.
- `RepoService` owns filesystem layout: `ROOT_DIR/<username>/<repo>`. Always resolve via `getUserRepoDir(username)` + `path.join` + traversal guard (`path.resolve` must start with base). Never `path.join(userInput)` unchecked.
- `GitService` wraps `simple-git` — no controller imports `simple-git` directly.

### 4.3 Frontend

- Zustand stores own fetching: `repoStore`, `commitStore`, `branchStore`, `activityStore`, `authStore`, `userStore`, `themeStore`. Components subscribe, never fetch directly with `axios` outside stores/services.
- `axios` baseURL from env (`VITE_API_URL`), with auth interceptor (JWT from `authStore`). No hardcoded `localhost:4642`.
- Every async view has 3 states: `loading (Skeleton)` / `error (Alert)` / `empty`. Skeletons already exist per page — reuse them.
- Large components split: `RepoDetailPage` composes `RepoFileTree`, `FileViewer`, `CommitList`, `BranchList`, `MarkdownRenderer`. Keep files <300 lines.

### 4.4 API design

- REST, plural nouns, kebab-free: `GET /api/repos`, `POST /api/repos {name}`, `GET /api/repos/:name`, `GET /api/repos/:name/commits`.
- New endpoints: nouns, version-tolerant JSON, `GET` lists paginated (`?page&limit`, default `limit=50`, max `200`). Errors: `{ error: { code, message, details? } }` with correct status (400 validation, 401 auth, 403 forbidden, 404 missing, 409 conflict, 500 unknown).
- Idempotent creates (repo create returns 409 if exists, not 500). Destructive ops require explicit confirm + audit log via `ActivityService`.
- Never break existing contract without major version + migration note in PR.

### 4.5 Security checklist (must pass before merge)

- [ ] Path traversal guard on every `:name`/file path param.
- [ ] Auth on all `/api/*` except Git Smart-HTTP bypass + `/api/auth/*` + health.
- [ ] JWT secret from env, bcrypt cost ≥10, no password hashes in logs/responses.
- [ ] No secrets in image layers (`docker history` clean), no `.env` in `COPY`.
- [ ] `ssh_host_rsa_key` never committed to a public repo — mount as secret/volume in prod. Current checked-in key is dev-only; rotate before any demo deploy.
- [ ] `npm audit` / `pnpm audit` with no `high` unfixed without waiver comment.

---

## 5. Git — Conventional Commits + Branching (Strict)

Format: `<type>(<scope>): <subject>` — subject imperative, lowercase, no period, ≤72 chars.

Types: `feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert`.

Scopes: `backend | frontend | ui | api | auth | git | ssh | docker | stack | deps | docs | dx`.

```bash
feat(backend): add branch-switch endpoint with traversal guard
fix(frontend): handle empty commit list without crash
test(backend): cover RepoService.create conflict path
chore(docker): pin backend image to sha
```

Branching: `main` is deployable. `feat/<slug>`, `fix/<slug>`, `chore/<slug>`. One logical change per PR. Rebase over `main` before push; squash-merge. When tied to an issue, include the number: `feat/123-branch-switch`, `fix/45-empty-commits-crash`.

Commit loop: atomic commits, `git status` + `git diff` reviewed, never `git add -A` blindly, never commit `node_modules`, `dist`, `data`, `.env`, `*.db`, SSH private keys. Verify hooks pass (`build`, `lint`, `test`).

### 5.1 GitHub Issue Awareness (Mandatory — no work without an issue check)

> **Rule: never start code without checking `gh issue` first. Never open a duplicate issue. Every PR resolves or references an issue.**

**A. Before any Loop 0 — search for similar/existing issues:**

```bash
gh issue list --limit 50 --state all --search "<3-5 keywords from task>"
gh issue list --limit 50 --state open  # triage view
gh issue view <number> --comments      # read candidate match fully before deciding
```

- If a similar **open** issue exists → do NOT create a new one. Comment your intent (`/take or working on this as part of #<n>`) and use that number for branch/PR references.
- If a similar **closed** issue exists → link it in your new issue (`Related to #<n>`) and explain why it is different (regression vs new case).
- If none exists → create one with the template below before coding (Loop 0 output requires an issue number).

**B. Issue format (title follows conventional-commit subject):**

```md
Title: feat(backend): branch switching from UI
Body:
## Problem / Why
## Expected vs Actual
## Repro steps / API + payload
## Related issues: #<n> (or `None — searched "<keywords>"`)
## Scope guess: backend/services/GitService + frontend/stores/branchStore
```

**C. Linking — how resolve references work:**

- Branch: `feat/123-<slug>` (number = canonical issue).
- Commits (optional ref, never close in commit): `feat(backend): add checkout endpoint Refs #123`.
- PR body **must** contain exactly one of:
  - `Closes #123` / `Fixes #123` — issue auto-closes on merge (use when fully resolved).
  - `Refs #123` / `Related to #123` — partial work, follow-up remains (explain what is left).
- A PR that `Closes` multiple issues lists each: `Closes #12, Closes #34`. A PR with no issue link is rejected in review.
- After merge, verify: `gh issue view <number>` shows `Closed` (if `Closes`) or your progress comment (if `Refs`).

**D. During the loop — keep the issue as source of truth:**

- LOOP 0 output = `Issue #<n>: <title> (+ duplicates checked: #a, #b or none)`.
- If scope creeps beyond the issue → stop, comment on the issue, open a follow-up issue, link it (`Follow-up to #<n>`).
- Before LOOP 6, re-read `gh issue view <n> --comments` to ensure no one else already fixed/changed requirements.

---

## 6. Tool Standards (CLI / DX / Build)

1. **Deterministic builds:** `pnpm build` at root must succeed offline-after-install. Esbuild (backend) + `tsc -b && vite build` (frontend) — keep them fast; no new build step without `turbo.json` pipeline entry + cache `outputs`.
2. **Errors that teach:** every thrown CLI/server-boot error = `message + expected vs actual + fix command`. Example: `ROOT_DIR missing: set ROOT_DIR in apps/backend/.env (see .env.example)`.
3. **Logs:** backend `middleware/logger.ts` → structured stdout (`ts`, `level`, `reqId`, `method`, `path`, `latencyMs`). No `console.log` in prod paths — use logger. Frontend: no console noise in `build`.
4. **Config:** `.env.example` is the schema. Any new env var → update `.env.example` + `config.ts` + `Dockerfile`/`compose`/`stack` + README in same PR.
5. **Scripts:** root `package.json` scripts are the public interface. Don't add ad-hoc shell scripts without documenting in README + AGENTS.md.

---

## 7. DevOps / Platform / Container Orchestration

### 7.1 Docker rules

- Multi-stage builds. Backend runs compiled `dist/` (esbuild), not `tsx` in prod. Frontend served via `nginx.conf` (SPA fallback).
- `HEALTHCHECK` on both images (`/api/health` backend, `/` frontend). Compose `depends_on: condition: service_healthy` for frontend→backend where possible.
- Volumes are the only state: `repo_data:/data/repos`, `db_data:/data/db`. Containers are disposable — `docker compose down -v && docker compose up --build` must reseed cleanly.
- Resource limits in `docker-stack.yml` are mandatory (backend `1cpu/512M`, frontend `1cpu/256M`). Any increase needs justification + load evidence in PR.
- Swarm: `replicas: 1` (SQLite constraint — do NOT scale backend >1 without migrating to Postgres). `update_config: parallelism 1, order start-first`. `placement max_replicas_per_node: 1`. Overlay network `app_net`.

### 7.2 Twelve-factor checklist for every change

- [ ] Config via env, documented.
- [ ] Stateless process (sticky state only in volumes).
- [ ] Logs to stdout, no log files in image.
- [ ] Graceful shutdown (`SIGTERM` → close HTTP + SSH + DB).
- [ ] Backwards-compatible DB migration (`utils/migrate.ts`), reversible.

### 7.3 CI expectation (if `.github/` workflow missing, add it)

Pipeline: `install → lint → build → test (with coverage) → docker build → compose smoke (curl /api/health + frontend /)`. Block merge on red. Cache pnpm store + turbo.

---

## 8. Loop Engineering — The Mandatory Development Loop

> **Loop Engineering** = every task runs as a closed verification loop. No open loops. No "probably works." You iterate `Understand → Plan → Implement → Test → Verify → Harden → Commit` until ALL gates are green, then stop.

### 8.1 The Loop (run for EVERY issue/feature/fix)

```text
┌──────────────────────────────────────────────────────────┐
│ LOOP 0 — UNDERSTAND                                      │
│ gh issue check (§5.1) + read issue + src + tests.        │
│ git status clean?                                        │
│ Output: Issue #<n> + 3-bullet problem + files to touch.  │
├──────────────────────────────────────────────────────────┤
│ LOOP 1 — PLAN (TodoWrite)                                │
│ Break into ≤5 todos. Mark ONE in_progress at a time.     │
│ Output: todo list + test plan (what test proves done).   │
├──────────────────────────────────────────────────────────┤
│ LOOP 2 — RED (failing test first)                        │
│ Add/adjust test that FAILS for the right reason.         │
│ Run: pnpm test -- <file>. Confirm red.                   │
├──────────────────────────────────────────────────────────┤
│ LOOP 3 — GREEN (minimal fix)                             │
│ Smallest change to green. No drive-by refactors.         │
│ Run: focused test → tsc/eslint → full suite.             │
├──────────────────────────────────────────────────────────┤
│ LOOP 4 — VERIFY (prove it)                               │
│ Full gates: build + lint + test --coverage + smoke.      │
│ Backend: curl API. Frontend: vite build + click path.    │
│ Docker (if infra touched): compose up + health checks.   │
├──────────────────────────────────────────────────────────┤
│ LOOP 5 — HARDEN (edge + security + docs)                 │
│ Traversal? Auth? Empty? Conflict? Large? Unicode?        │
│ Update .env.example/README/docs if contract changed.     │
├──────────────────────────────────────────────────────────┤
│ LOOP 6 — COMMIT (conventional + atomic)                  │
│ git status/diff review → stage intent-only → commit.     │
│ Push + PR with `Closes/Refs #<n>` + test evidence.       │
│ Done = gates green on CI + issue linked/closed.          │
└──────────────────────────────────────────────────────────┘
         ▲                                            │
         └──── any gate RED → fix, re-enter at LOOP 3 ─┘
```

**Loop rules:**

1. Max 3 green attempts per loop before stepping back to re-plan (LOOP 1). Don't thrash.
2. Never skip RED. If you can't write a failing test, you don't understand the bug.
3. Never batch unrelated fixes to "save a loop." One loop = one behavior change.
4. Every loop ends with executed commands + pasted evidence (not "should pass").
5. Stop condition: `build ✅ lint ✅ test ✅ coverage ≥ thresholds ✅ smoke ✅`.

### 8.2 Gate thresholds (enforced)

- Backend: lines ≥80%, branches ≥75% on `services/` + `controllers/` + `middleware/`. No drop in coverage vs `main` without justification.
- Frontend: new UI logic ships with component/store test or explicit `test(frontend): TODO` issue link + `// TODO(test):` comment. No silent untested stores.
- `tsc -b` clean, `eslint .` clean (zero warnings on touched files).
- Compose smoke: `GET /api/health → 200`, `GET /api/repos → 401 without token / 200 with token`, frontend `/ → 200`.

### 8.3 Complete Test Implementations (copy-paste patterns)

Backend stack: `jest@30 + ts-jest + supertest + sqlite (in-memory or tmp)`. Config: `jest.config.cjs` (`testMatch **/*.test.ts`, `@backend/*` alias). TS: `tsconfig.test.json`.

**A. Service unit test — `RepoService` (pattern for ALL services):**

```ts
// apps/backend/src/services/__tests__/RepoService.test.ts
import fs from "fs";
import os from "os";
import path from "path";
import { RepoService } from "../RepoService";

describe("RepoService", () => {
  let tmp: string;
  let svc: RepoService;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gitshelf-"));
    svc = new RepoService({ rootDir: tmp }); // inject root — never touch real ROOT_DIR
  });

  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it("creates a repo (GREEN path)", async () => {
    const repo = await svc.create("alice", "demo");
    expect(repo.name).toBe("demo");
    expect(fs.existsSync(path.join(tmp, "alice", "demo"))).toBe(true);
  });

  it("rejects path traversal (HARDEN path)", async () => {
    await expect(svc.create("alice", "../evil")).rejects.toThrow(/invalid/i);
    await expect(svc.create("alice", "a/b")).rejects.toThrow(/invalid/i);
    expect(fs.existsSync(path.join(tmp, "evil"))).toBe(false);
  });

  it("conflicts on duplicate (idempotency path)", async () => {
    await svc.create("alice", "demo");
    await expect(svc.create("alice", "demo")).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
```

Service error contract: throw `{ code: "NOT_FOUND" | "CONFLICT" | "VALIDATION", message }` — controllers map `CONFLICT→409`, `NOT_FOUND→404`, `VALIDATION→400`.

**B. Controller / route integration test — supertest + app (pattern for ALL routes):**

```ts
// apps/backend/src/routes/__tests__/repoRoutes.test.ts
import request from "supertest";
import { buildApp } from "../../app";

const app = buildApp(); // must not .listen() — supertest injects

describe("GET /api/repos", () => {
  it("401 without token", async () => {
    await request(app).get("/api/repos").expect(401);
  });

  it("200 lists repos with token", async () => {
    const token = await loginAsTestUser(app); // helper: seed sqlite-memory + jwt
    const res = await request(app)
      .get("/api/repos")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/repos/:name/commits returns [] for empty repo", async () => {
    const token = await loginAsTestUser(app);
    await request(app).post("/api/repos").set("Authorization", `Bearer ${token}`).send({ name: "empty" }).expect(201);
    const res = await request(app).get("/api/repos/empty/commits").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body).toEqual([]);
  });
});
```

Rules: isolated DB per file (`sqlite::memory:` or tmp file + `migrate()` in `beforeAll`, truncate in `afterEach`). Never hit real `/data`. Never depend on test order.

**C. Middleware invariant — keep `gitMiddlewareBypass.test.ts` green:**

Any change to `auth.ts`, `shouldBypassGit.ts`, `rawBody.ts`, `jsonParser.ts`, or route order must add a case here:

```ts
it("lets Git Smart-HTTP through without JSON auth", async () => {
  await request(app).get("/repo.git/info/refs?service=git-upload-pack").expect((r) => {
    expect([200, 401]).toContain(r.status); // 401 only from git-credential layer, never 400 JSON error
    expect(r.headers["content-type"] ?? "").not.toMatch(/json.*error/i);
  });
});
```

**D. Frontend store test (requires adding vitest — do it when touching stores):**

```bash
# one-time setup (same PR that adds first frontend test)
pnpm --filter frontend add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```ts
// apps/frontend/src/stores/__tests__/repoStore.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { useRepoStore } from "../repoStore";

vi.mock("axios");
const mocked = vi.mocked(axios, true);

beforeEach(() => {
  useRepoStore.setState({ repos: [], loading: false, error: null });
  vi.resetAllMocks();
});

describe("repoStore", () => {
  it("loads repos (GREEN)", async () => {
    mocked.get.mockResolvedValueOnce({ data: [{ name: "demo" }] });
    await useRepoStore.getState().fetchRepos();
    expect(useRepoStore.getState().repos).toHaveLength(1);
  });

  it("surfaces error (HARDEN)", async () => {
    mocked.get.mockRejectedValueOnce(new Error("network down"));
    await useRepoStore.getState().fetchRepos();
    expect(useRepoStore.getState().error).toMatch(/network/i);
  });
});
```

Add to `apps/frontend/package.json`: `"test": "vitest run", "test:watch": "vitest"` and run via `turbo run test`.

**E. E2E smoke (docker/compose gate):**

```bash
# after docker compose up --build -d
curl -sf http://localhost:4642/api/health
curl -s http://localhost:4642/api/repos | grep -q Unauthorized
curl -sf http://localhost:8080/ | head -c 200
docker compose logs backend --tail=50 | grep -i "listening\|ready"
```

Any Loop 4 failure → back to Loop 3. Paste all four outputs in PR.

### 8.4 What "Done" means (Definition of Done)

- [ ] Loop 0–6 executed, evidence pasted (test output, build, curl).
- [ ] `pnpm build ✅  pnpm lint ✅  pnpm test ✅` at root (or scoped with reason).
- [ ] Coverage thresholds met, no snapshot abuse (no blind `--u`).
- [ ] Security checklist (§4.5) + 12-factor checklist (§7.2) ticked.
- [ ] Docs updated: README / `.env.example` / `SSH_SETUP.md` / `docs/` if behavior/env/API changed.
- [ ] Conventional commit(s), clean `git status`, PR describes `what/why/how-tested/rollback`.
- [ ] Issue linkage: `gh issue view #<n>` checked pre-work (no duplicate) and PR body has `Closes #<n>` or `Refs #<n>` with verification after merge.

---

## 9. Common Tasks — Playbooks

| Task | Do |
|---|---|
| New API endpoint | Route (wiring) → Controller (validate+map) → Service (logic) → Sequelize/simple-git. Add supertest file per §8.3B. Update README API table. |
| New Sequelize model | Entity in `models/sequelize/`, domain type in `models/`, migration in `utils/migrate.ts`, export in `models/index.ts`. Keep SQLite↔Postgres portable. |
| Branch switching / commit snapshot (TODO.md) | `GitService`: `listBranches`, `checkout`, `showAtCommit`, `diffAtCommit`. Guard detached-HEAD + traversal. UI: `branchStore` + `BranchList` + `FileViewer@commit`. Tests: service + route + store. |
| Activity logs (TODO.md) | Write via `ActivityService` on every mutation (repo create/delete, auth, push). `GET /api/activity?page&limit`. Frontend `ActivitiesPage` already wired — keep pagination + skeleton. |
| SSH change | Touch `SshServerService`/`GitSshService` only. Never log keys. Test with ephemeral keypair in tmp. Update `SSH_SETUP.md` + compose/stack secret wiring same PR. |
| Frontend page | Page + store + `components/*Skeleton` + `Alert` error path. No direct `fetch` in components. `pnpm build` must stay warning-free. |
| Docker/infra | Update `Dockerfile` + `compose` + `stack` together. Prove with `docker compose up --build` + §8.3E smoke. Document image tags + volumes. |

---

## 10. Anti-Patterns — Will Be Rejected in Review

1. Logic in routes, `fs`/`simple-git`/SQL in controllers.
2. `any`, `// @ts-ignore`, `console.log` left in, commented-out code.
3. Hardcoded `localhost`, ports, paths, secrets.
4. `GET` that mutates, `POST` that should be idempotent `PUT`, missing status codes.
5. Unpaginated list endpoints, N+1 git/DB calls in a loop without batching.
6. `git add -A` + `fix stuff` commits, committing `.env`/`data`/`dist`/`*.db`/keys.
7. New dependency without justification + audit + compose/stack/docs update.
8. Scaling backend replicas >1 on SQLite, or `latest` tags without pin note.
9. Tests that hit real disk `/data`, real DB, network, or depend on order/time.
10. "Works on my machine" without Loop 4 evidence.

---

## 11. PR Template (paste into every PR)

```md
## What / Why
<!-- link issue, 2-3 sentences -->
Closes #<n>  <!-- or Refs #<n> if partial — exactly one required, see §5.1C -->

## How
<!-- layers touched: routes/controllers/services/models/frontend/stores/infra -->

## Loop evidence (paste, don't summarize)
- [ ] pnpm build: <output>
- [ ] pnpm lint: <output>
- [ ] pnpm test --coverage: <output + coverage table>
- [ ] smoke: curl /api/health, /api/repos, frontend / outputs
- [ ] docker (if touched): compose up + logs

## Risk / Rollback
<!-- migration? reversibility? `git revert <sha>` safe? -->

## Checklists
- [ ] Security §4.5 | [ ] 12-factor §7.2 | [ ] DoD §8.4
```

---

*End of AGENTS.md. When in doubt: smaller diff, stronger test, clearer error, reversible commit.*
