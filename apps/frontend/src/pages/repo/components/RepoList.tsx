import {useState} from "react";
import {ArchiveBoxIcon} from "@heroicons/react/24/outline";
import type {RepoItem} from "~/props/Repos";

interface RepoListProps {
  repos: RepoItem[];
  selectedRepo: string | null;
  viewRepo: (name: string) => void;
}

export const RepoList: React.FC<RepoListProps> = ({
  repos,
  selectedRepo,
  viewRepo,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayName = (name: string) => name.replace(/\.git$/, ""); // remove .git

  return (
    <div>
      <h2 className="text-sm text-white font-bold mb-3">Repositories</h2>

      <ul className="space-y-2">
        {repos.map((repo) => (
          <li
            key={repo.name}
            className={`flex items-center justify-between p-3border-b border-gray-200 cursor-pointer transition ${
              selectedRepo === repo.name ? "underline border-white" : ""
            }`}
            onClick={() => viewRepo(repo.name)}
          >
            {/* Left: Icon + Repo Name */}
            <div className="flex items-center gap-2">
              <ArchiveBoxIcon className="w-5 h-5  text-white " />
              <span className="font-bold text-xs text-white ">
                {displayName(repo.name)}
              </span>
            </div>

            {/* Right: SSH/HTTPS Buttons */}
            <div className="flex gap-2">
              {/* SSH Button */}
              <div className="relative">
                <button
                  title={repo.sshAddress ?? undefined}
                  className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 font-bold bg-yellow-200  hover:bg-gray-200 text-[7pt]"
                  onClick={(e) => {
                    e.stopPropagation();
                    repo.sshAddress && handleCopy(repo.sshAddress);
                  }}
                >
                  SSH
                </button>
                {copied === repo.sshAddress && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-black text-white shadow-md whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </div>

              {/* HTTPS Button */}
              <div className="relative">
                <button
                  title={repo.httpAddress ?? undefined}
                  className="flex items-center gap-1 px-2 py-0.5 bg-gray-100  font-bold  bg-red-200 hover:bg-gray-200 text-[7pt]"
                  onClick={(e) => {
                    e.stopPropagation();
                    repo.httpAddress && handleCopy(repo.httpAddress);
                  }}
                >
                  HTTPS
                </button>
                {copied === repo.httpAddress && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-black text-white shadow-md whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
