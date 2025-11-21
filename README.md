# Monorepo Project Template

A **monorepo template** using **PNPM Workspaces** and **Turborepo**.
This repository includes a frontend, backend, and shared UI component library.

---

## Project Structure

```
myapp/
├── apps/
│   ├── frontend/        # React frontend app
│   └── backend/         # Node.js / Express backend app
├── packages/
│   └── ui/              # Shared React UI component library
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Workspaces

- **Frontend**: React + TypeScript + Vite. Uses shared UI components from `@myapp/ui`.
- **Backend**: Node.js + TypeScript + Express (or any other backend framework).
- **UI Library**: Shared React components (`Button`, `Page`, `Table`, etc.) built with TypeScript.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [PNPM](https://pnpm.io/) >= 8
- [Turborepo](https://turbo.build/) (installed via dev dependencies)

### Install dependencies

```bash
pnpm install
```

---

## Development

Run all apps and packages in parallel:

```bash
pnpm dev
```

- Frontend: [http://localhost:5173](http://localhost:5173) (default Vite port)
- Backend: [http://localhost:3000](http://localhost:3000)

### Frontend

```bash
cd apps/frontend
pnpm dev
```

Vite frontend is configured to use a **proxy** to your backend. Add the following to `vite.config.ts`:

```ts
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

This allows you to call backend APIs without CORS issues using paths like `/api/users`.

### Backend

```bash
cd apps/backend
pnpm dev
```

### UI Library

Build or watch the shared UI components:

```bash
cd packages/ui
pnpm build       # Compile TypeScript
pnpm dev         # Watch mode
```

---

## Build

Build all apps and packages for production:

```bash
pnpm build
```

- Frontend: Compiled to `dist/`
- Backend: Compiled to `dist/`
- UI Library: Compiled to `dist/` and ready to be consumed by frontend or other apps

---

## Linting

```bash
pnpm lint
```

Uses ESLint for frontend, backend, and UI packages.

---

## Testing

```bash
pnpm test
```

Runs all tests across apps and packages (supports `vitest` or `jest` depending on setup).

---

## Usage Example (Frontend + UI Library + Proxy)

```tsx
import {Page, Button, Table} from "@myapp/ui";
import {useEffect, useState} from "react";

function App() {
  const [users, setUsers] = useState<{id: number; name: string}[]>([]);

  useEffect(() => {
    fetch("/api/users") // Note: no need for full localhost URL because of Vite proxy
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <Page id="page-1" className="p-6">
      <h1 className="text-xl font-bold mb-4">Users List</h1>
      <Table
        items={users}
        emptyMessage="No users found."
        className="overflow-hidden"
        columns={[
          {header: "ID", render: (user) => user.id},
          {header: "Name", render: (user) => user.name},
        ]}
      />
    </Page>
  );
}
```

---

## Contributing

- Create feature branches for new functionality
- Update TypeScript types and UI components in `packages/ui` as needed
- Ensure linting and tests pass before submitting pull requests

---

## License

[MIT](LICENSE)
