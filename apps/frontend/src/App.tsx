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
  const viewRepo = async (name: string) => {
    try {
      const res = await axios.get<FileNode[]>(`/api/repos/${name}`);
      setFileTree(res.data);
      setSelectedRepo(name);
      fetchCommits(name);
    } catch (err) {
      console.error("Failed to fetch repo content:", err);
    }
  };
  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <Page>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Repository Hub
        </h1>

        {/* Create Repo */}
        <div className="flex mb-4  mx-auto">
          <input
            type="text"
            placeholder="New repo name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={createRepo}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r-md hover:bg-blue-600 transition"
          >
            Create Repo
          </button>
        </div>

        {/* Three-pane layout */}
        <div className="flex gap-4  mx-auto h-[600px]">
          {/* Left: Repo List */}
          <div className="w-1/4 border border-gray-200 p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Repositories
            </h2>
            <ul className="space-y-2">
              {repos.map((r) => (
                <li
                  key={r}
                  className={`flex justify-between items-center p-3 border rounded-md cursor-pointer transition
                    ${
                      selectedRepo === r
                        ? "bg-blue-100 border-blue-400"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  onClick={() => viewRepo(r)}
                >
                  <span className="font-medium text-gray-800">{r}</span>
                  <button
                    className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition"
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
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              {selectedRepo ? `${selectedRepo}` : "Select a repo"}
            </h2>
            {fileTree.length > 0 ? (
              <FileTree nodes={fileTree} />
            ) : (
              <p className="text-gray-500">Select a repo to view its files.</p>
            )}
          </div>

          {/* Right: Commits (placeholder) */}
          <div className="w-1/4 border border-gray-200 p-4 h-full overflow-auto">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Commits
            </h2>
            {commits.length > 0 ? (
              <ul className="space-y-2">
                {commits.map((c) => (
                  <li key={c.hash} className="p-2  hover:bg-gray-50 transition">
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
        </div>
      </div>
    </Page>
  );
};

export default App;
