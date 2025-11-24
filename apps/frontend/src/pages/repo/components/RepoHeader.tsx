import type {FC} from "react";

interface RepoHeaderProps {
  repoName: string;
  setRepoName: (name: string) => void;
  createRepo: () => void;
}

export const RepoHeader: FC<RepoHeaderProps> = ({
  repoName,
  setRepoName,
  createRepo,
}) => (
  <div className="flex items-center justify-between bg-black p-3  shadow-md">
    {/* Logo Block */}
    <div className="inline-block rounded-lg px-2">
      <h1 className="text-xl font-bold text-white">
        Repo<span className="text-green-300">Hub</span>
      </h1>
      <p className="text-gray-300 text-xs">
        Manage and explore Git repositories
      </p>
    </div>

    {/* Input + Button */}
    <div className="flex items-center space-x-2">
      <button
        onClick={createRepo}
        className="px-5 py-1 bg-green-300 text-black text-sm font-semibold shadow hover:bg-green-400 transition"
      >
        Create Repository
      </button>
      <input
        type="text"
        placeholder="Enter repository name"
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
        className="px-4 py-1 border border-gray-600  text-sm bg-[#181818] text-white  focus:ring-2 focus:ring-transparent focus:outline-none"
      />
    </div>
  </div>
);
