// App.tsx
import {useEffect, useState} from "react";
import axios from "axios";
import {FileTree, Page} from "@myapp/ui";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

const App: React.FC = () => {
  const [repos, setRepos] = useState<string[]>([]);
  const [repoName, setRepoName] = useState<string>("");
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>("");

  const fetchRepos = async () => {
    try {
      const res = await axios.get<string[]>("/api/repos");
      setRepos(res.data);
    } catch (err) {
      console.error("Failed to fetch repos:", err);
    }
  };

  const createRepo = async () => {
    if (!repoName.trim()) return;
    try {
      await axios.post("/api/repos", {name: repoName});
      setRepoName("");
      fetchRepos();
    } catch (err) {
      console.error("Failed to create repo:", err);
    }
  };

  const fetchCommits = async (repoName: string) => {
    try {
      const res = await axios.get<Commit[]>(`/api/repos/${repoName}/commits`);
      setCommits(res.data);
    } catch (err) {
      console.error("Failed to fetch commits:", err);
    }
  };

  const fetchBranches = async (repoName: string) => {
    try {
      const res = await axios.get<{current: string; branches: string[]}>(
        `/api/repos/${repoName}/branches`
      );
      setBranches(res.data.branches);
      setCurrentBranch(res.data.current);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  const viewRepo = async (name: string) => {
    try {
      const res = await axios.get<FileNode[]>(`/api/repos/${name}`);
      setFileTree(res.data);
      setSelectedRepo(name);
      fetchCommits(name);
      fetchBranches(name);
    } catch (err) {
      console.error("Failed to fetch repo content:", err);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <Page>
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-between bg-black shadow-lg p-2 mx-auto">
          {/* Title on the left */}
          <div className="inline-block  rounded-lg px-2 shadow-md">
            <h1 className="text-3xl font-bold text-white">
              Repo<span className="text-green-300">Hub</span>
            </h1>
            <p className="text-gray-200 text-xs">
              Manage and explore your Git repositories easily
            </p>
          </div>

          {/* Create Repo on the right */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter repository name"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300  placeholder-gray-400 transition"
            />
            <button
              onClick={createRepo}
              className="px-5 py-2 bg-green-300 text-black font-medium rounded-md shadow hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300  focus:ring-offset-1 transition"
            >
              Create
            </button>
          </div>
        </div>

        {/* Three-pane layout */}
        <div className="flex gap-4 mx-auto h-[600px]">
          {/* Left: Repo List */}
          <div className="w-1/4 border border-gray-200 p-4 overflow-auto">
            <h2 className="text-base font-bold mb-3 text-gray-700">
              Repositories
            </h2>
            <ul className="space-y-2">
              {repos.map((r) => (
                <li
                  key={r}
                  className={`flex justify-between items-center p-3 shadow  rounded-md cursor-pointer transition
                    ${
                      selectedRepo === r
                        ? "bg-blue-100 border-blue-400"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  onClick={() => viewRepo(r)}
                >
                  <span className="font-medium text-gray-800">{r}</span>
                  <button
                    className="px-2 py-1 bg-green-300 text-black text-sm rounded-md hover:bg-green-600 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewRepo(r);
                    }}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: File Tree */}
          <div className="w-1/2 border border-gray-200 p-4 h-full overflow-auto">
            {selectedRepo && (
              <p className="mb-2 font-medium text-sm text-gray-700">
                Current Branch:{" "}
                <span className="font-bold">{currentBranch}</span>
              </p>
            )}
            <h2 className="text-base font-bold mb-3 text-gray-700">
              {selectedRepo ? `${selectedRepo}` : "Select a repo"}
            </h2>

            {fileTree.length > 0 ? (
              <FileTree nodes={fileTree} />
            ) : (
              <p className="text-gray-500">Select a repo to view its files.</p>
            )}
          </div>

          {/* Right: Commits + Branches */}
          <div className="w-1/4 border border-gray-200 p-4 h-full flex flex-col overflow-auto">
            {/* Current Branch */}

            {/* Top: Commits */}
            <div className="flex-1 overflow-auto mb-2">
              <h2 className="text-base font-bold mb-3 text-gray-700">
                Commits
              </h2>
              {commits.length > 0 ? (
                <ul className="space-y-2">
                  {commits.map((c) => (
                    <li
                      key={c.hash}
                      className="p-2 hover:bg-gray-50 shadow transition"
                    >
                      <p className="font-medium text-gray-800">{c.message}</p>
                      <p className="text-sm text-gray-500">
                        {c.author} • {new Date(c.date).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        #{c.hash.slice(0, 7)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No commits yet.</p>
              )}
            </div>

            {/* Bottom: Branches */}
            <div className="flex-none mt-2 border-t border-gray-300 pt-2 overflow-auto max-h-40">
              <h2 className="text-base font-bold mb-2 text-gray-700">
                Branches
              </h2>
              {branches.length > 0 ? (
                <ul className="space-y-1">
                  {branches.map((b) => (
                    <li
                      key={b}
                      className={`p-1 rounded-md shadow ${
                        b === currentBranch
                          ? "bg-green-300 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No branches</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default App;
