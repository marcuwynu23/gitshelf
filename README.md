<div align="center">
  <h1> # Repohub
 </h1>
</div>

<p align="center">
  <img src="https://img.shields.io/github/stars/marcuwynu23/repohub.svg" alt="Stars Badge"/>
  <img src="https://img.shields.io/github/forks/marcuwynu23/repohub.svg" alt="Forks Badge"/>
  <img src="https://img.shields.io/github/issues/marcuwynu23/repohub.svg" alt="Issues Badge"/>
  <img src="https://img.shields.io/github/license/marcuwynu23/repohub.svg" alt="License Badge"/>
</p>
Repohub is a lightweight Git repository manager built with **Node.js/Express** for the backend and **React + TailwindCSS** for the frontend. It allows you to:

- Create Git repositories locally.
- Browse repository files in a tree view.
- View recent commits for each repository.
- Manage repositories without using external Git hosting services.

---

## Features

- **Repository Management:** Create, list, and view repositories.
- **File Explorer:** Browse repository contents with a folder/file tree view.
- **Commits Viewer:** See the latest commits of a repository.
- **Lightweight & Local:** Runs entirely on your local machine or server.
- **TailwindCSS UI:** Clean and responsive frontend.

---

## Tech Stack

- **Backend:** Node.js, Express, Simple-Git
- **Frontend:** React, TypeScript, TailwindCSS
- **Other:** Dotenv, Axios

---

## Getting Started

### Prerequisites

- Node.js v20+
- Git installed on your machine

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/repohub.git
cd repohub
```

2. Install dependencies for backend and frontend:

```bash
# Root project
pnpm install
```

3. Create a `.env` file in the backend (`apps/backend`) with the following:

```env
ROOT_DIR=./data
```

4. Start the backend server:

```bash
cd apps/backend
pnpm dev
```

5. Start the frontend:

```bash
cd apps/frontend
pnpm dev
```

6. Open your browser at [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

### Repositories

- **GET** `/api/repos` - List all repositories.
- **POST** `/api/repos` - Create a new repository.

  ```json
  {"name": "repo-name"}
  ```

- **GET** `/api/repos/:name` - Get file tree of a repository.
- **GET** `/api/repos/:name/commits` - Get recent commits (returns empty array if no commits).

### Example Response: Commits

```json
[
  {
    "hash": "abcd123",
    "message": "Initial commit",
    "author": "John Doe",
    "date": "2025-11-21T05:00:00Z"
  }
]
```

---

## Frontend Structure

- **Repo List:** Left sidebar
- **File Tree:** Center
- **Commits:** Right sidebar
- Uses `@myapp/ui` for FileTree component.

---

## Future Improvements

- Support multiple branches.
- Add commit creation directly from the UI.
- Push/pull from remote repositories.
- User authentication.

---

## License

MIT License
