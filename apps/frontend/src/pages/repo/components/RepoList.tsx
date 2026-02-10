import {useState, useRef, useEffect} from "react";
import {useLocation, Link} from "react-router-dom";
import {
  FolderOpenIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import {Badge} from "~/components/ui/Badge";
import type {RepoItem} from "~/props/Repos";

interface CloneDropdownProps {
  sshUrl?: string | null;
  httpUrl?: string | null;
  onCopy: (val: string) => void;
}

const CloneDropdown: React.FC<CloneDropdownProps> = ({
  sshUrl,
  httpUrl,
  onCopy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!sshUrl && !httpUrl) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 bg-app-surface border border-app-border rounded-lg text-xs font-medium text-text-primary hover:bg-app-hover transition-colors shadow-sm"
      >
        <span>Clone</span>
        <ChevronDownIcon className="w-3 h-3 text-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-72 bg-app-surface border border-app-border rounded-lg shadow-xl z-50 py-1">
          {sshUrl && (
            <div className="px-3 py-2 border-b border-app-border last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text-primary">
                  SSH
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[10px] bg-app-bg p-1.5 rounded border border-app-border text-text-secondary truncate font-mono">
                  {sshUrl}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(sshUrl);
                    setIsOpen(false);
                  }}
                  className="p-1.5 hover:bg-app-hover rounded text-text-primary transition-colors"
                  title="Copy SSH URL"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {httpUrl && (
            <div className="px-3 py-2 border-b border-app-border last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text-primary">
                  HTTPS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[10px] bg-app-bg p-1.5 rounded border border-app-border text-text-secondary truncate font-mono">
                  {httpUrl}
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(httpUrl);
                    setIsOpen(false);
                  }}
                  className="p-1.5 hover:bg-app-hover rounded text-text-primary transition-colors"
                  title="Copy HTTPS URL"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface RepoListProps {
  repos: RepoItem[];
  selectedRepo: string | null;
}

export const RepoList: React.FC<RepoListProps> = ({repos, selectedRepo}) => {
  const location = useLocation();
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
      <div className="text-center py-12 sm:py-20 bg-app-surface/10 rounded-xl border border-app-border border-dashed">
        <FolderOpenIcon className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
        <p className="text-text-primary font-medium">No repositories found</p>
        <p className="text-text-tertiary text-sm mt-1">
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
            className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
              isActive
                ? "bg-app-hover border-app-accent/30"
                : "bg-app-surface/40 border-app-border hover:bg-app-surface/60 hover:border-app-border hover:shadow-sm"
            }`}
          >
            {/* Left: Icon + Repo Name */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-app-border/50 flex items-center justify-center shrink-0 border border-app-border/30 group-hover:border-app-border/50 transition-colors">
                <FolderOpenIcon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={getRepoUrl(repo.name)}
                    className="font-semibold text-base text-text-primary truncate hover:text-app-accent hover:underline transition-colors"
                  >
                    {displayName(repo.title || repo.name)}
                  </Link>
                  {repo.archived && (
                    <Badge
                      variant="neutral"
                      size="sm"
                      className="text-[10px] py-0 h-5 bg-app-border border-app-border"
                    >
                      Archived
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <span className="font-mono opacity-70">{repo.name}</span>
                </div>
                {repo.description && (
                  <p
                    className="text-sm text-text-secondary line-clamp-2 mt-1"
                    title={repo.description}
                  >
                    {truncateDescription(repo.description)}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-app-border/50 sm:pl-4">
              <CloneDropdown
                sshUrl={repo.sshAddress}
                httpUrl={repo.httpAddress}
                onCopy={handleCopy}
              />
            </div>
          </div>
        );
      })}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-app-surface border border-app-border px-4 py-2 rounded shadow-lg">
          <p className="text-sm text-text-primary">Copied to clipboard!</p>
        </div>
      )}
    </div>
  );
};
