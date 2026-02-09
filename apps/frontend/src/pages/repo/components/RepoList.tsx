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
      <div className="text-center py-12 sm:py-20 bg-[#2d2d2d]/10 rounded-xl border border-[#3d3d3d] border-dashed">
        <FolderOpenIcon className="w-12 h-12 text-[#808080] mx-auto mb-3 opacity-50" />
        <p className="text-[#e8e8e8] font-medium">No repositories found</p>
        <p className="text-[#808080] text-sm mt-1">
          Create a new repository to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      {repos.map((repo) => {
        const isActive = isRepoActive(repo.name);
        return (
          <div
            key={repo.name}
            onClick={() => navigate(getRepoUrl(repo.name))}
            className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-app-accent/5 border-app-accent shadow-[0_0_0_1px_rgba(var(--app-accent),0.2)]"
                : "bg-[#2d2d2d]/40 border-[#3d3d3d] hover:bg-[#2d2d2d]/60 hover:border-[#505050] hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {/* Left: Icon + Repo Name */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#3d3d3d]/50 flex items-center justify-center shrink-0 border border-[#4d4d4d]/30 group-hover:border-[#4d4d4d]/50 transition-colors">
                <FolderOpenIcon className="w-5 h-5 text-app-accent opacity-80" />
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-[#e8e8e8] truncate group-hover:text-app-accent transition-colors">
                    {displayName(repo.title || repo.name)}
                  </span>
                  {repo.archived && (
                    <Badge
                      variant="neutral"
                      size="sm"
                      className="text-[10px] py-0 h-5 bg-[#3d3d3d] border-[#4d4d4d]"
                    >
                      Archived
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#808080]">
                  <span className="font-mono opacity-70">{repo.name}</span>
                </div>
                {repo.description && (
                  <p
                    className="text-sm text-[#b0b0b0] line-clamp-2 mt-1"
                    title={repo.description}
                  >
                    {truncateDescription(repo.description)}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3d3d3d]/50 sm:pl-4">
              {/* Copy Buttons */}
              <div className="flex items-center gap-1 bg-[#1e1e1e]/50 rounded-lg p-1 border border-[#3d3d3d]/50">
                {repo.sshAddress && (
                  <button
                    title="Copy SSH URL"
                    className="p-1.5 hover:bg-[#3d3d3d] rounded-md text-[#808080] hover:text-[#e8e8e8] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(repo.sshAddress!);
                    }}
                  >
                    <CommandLineIcon className="w-4 h-4" />
                  </button>
                )}
                {repo.httpAddress && (
                  <button
                    title="Copy HTTPS URL"
                    className="p-1.5 hover:bg-[#3d3d3d] rounded-md text-[#808080] hover:text-[#e8e8e8] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(repo.httpAddress!);
                    }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                className="ml-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-app-surface hover:bg-[#3d3d3d] rounded-lg border border-[#3d3d3d] hover:border-[#505050] transition-all text-sm font-medium text-[#e8e8e8] shadow-sm active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(getRepoUrl(repo.name));
                }}
              >
                Open
              </button>
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
