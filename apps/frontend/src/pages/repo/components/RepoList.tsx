import {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {
  CommandLineIcon,
  FolderOpenIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import {Badge} from "~/components/ui/Badge";
import type {RepoItem} from "~/props/Repos";

interface RepoListProps {
  repos: RepoItem[];
  selectedRepo: string | null;
}

export const RepoList: React.FC<RepoListProps> = ({repos, selectedRepo}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayName = (name: string) => name.replace(/\.git$/, "");
  const getRepoUrl = (name: string) =>
    `/repository/${encodeURIComponent(name)}`;

  // Check if repo is active based on URL
  const isRepoActive = (repoName: string) => {
    if (selectedRepo) {
      return selectedRepo === repoName;
    }
    const currentPath = location.pathname;
    const repoPath = getRepoUrl(repoName);
    return currentPath === repoPath;
  };

  const truncateDescription = (desc: string, length: number = 200) => {
    if (desc.length <= length) return desc;
    return desc.substring(0, length) + "...";
  };

  if (repos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#808080] text-sm">No repositories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {repos.map((repo) => {
        const isActive = isRepoActive(repo.name);
        return (
          <div
            key={repo.name}
            className={`group flex items-center justify-between p-3  border-b border-[#3d3d3d] cursor-pointer transition-colors ${
              isActive
                ? "bg-app-accent/10 border-app-accent"
                : "bg-transparent  hover:bg-[#353535] "
            }`}
          >
            {/* Left: Icon + Repo Name */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#e8e8e8] truncate">
                    {displayName(repo.title || repo.name)}
                  </span>
                  {repo.archived && (
                    <Badge
                      variant="neutral"
                      size="sm"
                      className="text-xs py-0 h-5"
                    >
                      Archived
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-[#606060] truncate">
                  {repo.name}
                </p>
                {repo.description && (
                  <p
                    className="text-xs text-[#808080] line-clamp-1"
                    title={repo.description}
                  >
                    {truncateDescription(repo.description)}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-1 flex-shrink-0">
              {/* Open Button */}
              <button
                title="Open repository"
                className="inline-flex items-center justify-center gap-1.5 px-2 py-1 hover:bg-app-surface rounded border border-transparent hover:border-[#3d3d3d] transition-colors active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(getRepoUrl(repo.name));
                }}
              >
                <FolderOpenIcon className="w-4 h-4 text-[#808080] flex-shrink-0" />
                <span className="text-xs text-[#808080] font-medium hidden sm:inline">
                  Browse
                </span>
              </button>

              {/* Copy Buttons */}
              {repo.sshAddress && (
                <button
                  title={repo.sshAddress}
                  data-copy="ssh"
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-1 hover:bg-app-surface rounded border border-transparent hover:border-[#3d3d3d] transition-colors active:scale-[0.98]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(repo.sshAddress!);
                  }}
                >
                  <CommandLineIcon className="w-4 h-4 text-[#808080] flex-shrink-0" />
                </button>
              )}
              {repo.httpAddress && (
                <button
                  title={repo.httpAddress}
                  data-copy="http"
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-1 hover:bg-app-surface rounded border border-transparent hover:border-[#3d3d3d] transition-colors active:scale-[0.98]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(repo.httpAddress!);
                  }}
                >
                  <LinkIcon className="w-4 h-4 text-[#808080] flex-shrink-0" />
                </button>
              )}
            </div>
          </div>
        );
      })}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-app-surface border border-[#3d3d3d] px-4 py-2 rounded shadow-lg">
          <p className="text-sm text-[#e8e8e8]">Copied to clipboard!</p>
        </div>
      )}
    </div>
  );
};
