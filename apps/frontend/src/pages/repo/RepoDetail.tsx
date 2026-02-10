// RepoDetail.tsx
import {Suspense, lazy, useEffect, useMemo, useState, useRef} from "react";
import {Breadcrumbs} from "~/components/ui";
import {Badge} from "~/components/ui/Badge";
import {useCommitStore} from "~/stores/commitStore";
import {useRepoStore} from "~/stores/repoStore";
import {useCodeViewStore} from "~/stores/useCodeViewStore";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon,
  Square2StackIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const RepoFileTree = lazy(() =>
  import("./components/RepoFileTree").then((module) => ({
    default: module.RepoFileTree,
  })),
);

const RepoFileTreeLoading = () => (
  <div className="flex-1 overflow-auto bg-app-bg">
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-app-accent border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-app-accent rounded-full"></div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-text-secondary animate-pulse">
        Loading repository files...
      </p>
    </div>
  </div>
);

interface RepoDetailProps {
  repoName: string;
  repoTitle?: string;
  isArchived?: boolean;
  description?: string;
  sshAddress?: string | null;
  httpAddress?: string;

  branches: string[];
  currentBranch: string | null;
  setCurrentBranch: (branch: string) => void; // ⬅️ string onl
  className?: string;
  onSettingsClick?: () => void;
}

const isFullSha = (s: string) => /^[0-9a-f]{40}$/i.test(s);

export const RepoDetail: React.FC<RepoDetailProps> = ({
  repoName,
  repoTitle,
  isArchived = false,
  description,
  sshAddress,
  httpAddress,
  branches,
  currentBranch,
  setCurrentBranch,
  className,
  onSettingsClick,
}) => {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isCloneMenuOpen, setIsCloneMenuOpen] = useState(false);
  const [viewQuery, setViewQuery] = useState("");
  const {fileTree, selectedFile, setSelectedFile, viewRepo} = useRepoStore();
  const {commits, fetchCommits} = useCommitStore();
  const [copied, setCopied] = useState<string | null>(null);

  // Refs for click outside
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const cloneMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(event.target as Node)
      ) {
        setIsViewMenuOpen(false);
      }
      if (
        cloneMenuRef.current &&
        !cloneMenuRef.current.contains(event.target as Node)
      ) {
        setIsCloneMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  };

  const viewRef = useCodeViewStore((s) => s.viewRef);
  const setViewRef = useCodeViewStore((s) => s.setViewRef);

  const displayName = (name: string) => name.replace(/\.git$/, "");

  useEffect(() => {
    fetchCommits(repoName);
  }, [repoName, fetchCommits]);

  useEffect(() => {
    const ref = viewRef.trim();
    viewRepo(repoName, ref.length ? ref : undefined);
  }, [repoName, viewRepo, viewRef]);

  const normalizedBranches = useMemo(() => {
    const uniq = new Set<string>();
    const list: string[] = [];

    const add = (b: unknown) => {
      const s = String(b ?? "").trim();
      if (!s) return;
      if (uniq.has(s)) return;
      uniq.add(s);
      list.push(s);
    };

    add(currentBranch);
    (branches ?? []).forEach(add);

    const curr = (currentBranch ?? "").trim();
    if (!curr) return list.sort((a, b) => a.localeCompare(b));

    const rest = list
      .filter((b) => b !== curr)
      .sort((a, b) => a.localeCompare(b));
    return [curr, ...rest];
  }, [branches, currentBranch]);

  const normalizedCommits = useMemo(() => {
    const uniq = new Set<string>();
    return (commits ?? [])
      .filter((c) => c && typeof c.hash === "string" && c.hash.trim().length)
      .filter((c) => {
        const h = c.hash.trim();
        if (uniq.has(h)) return false;
        uniq.add(h);
        return true;
      })
      .slice(0, 50);
  }, [commits]);

  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{label: string; href?: string; onClick?: () => void}> =
      [];
    crumbs.push({label: "Repositories", href: "/"});
    crumbs.push({
      label: displayName(repoName),
      onClick: selectedFile ? () => setSelectedFile(null) : undefined,
    });

    if (selectedFile) {
      const pathParts = selectedFile.split("/").filter(Boolean);
      pathParts.forEach((part, index) => {
        if (index < pathParts.length - 1) {
          crumbs.push({label: part, onClick: () => setSelectedFile(null)});
        } else {
          crumbs.push({label: part});
        }
      });
    }

    return crumbs;
  }, [repoName, selectedFile, setSelectedFile]);

  const onChangeView = (next: string) => {
    const ref = next.trim();
    setSelectedFile(null);
    setViewRef(ref);

    // If selected value is a branch name, update store currentBranch
    // If commit SHA (or empty/default), don't change currentBranch
    if (ref && normalizedBranches.includes(ref) && !isFullSha(ref)) {
      setCurrentBranch(ref);
    }
  };

  return (
    <div
      className={`w-full flex flex-col px-4 sm:px-6 lg:px-8 ${className ?? "h-full"}`}
    >
      <div className="sticky top-0 z-20 bg-app-bg/95 backdrop-blur-sm border-b border-app-border py-4 mb-4 transition-all">
        <div className="flex flex-col gap-4 w-full">
          {/* Top Row: Title, Badges, Breadcrumbs */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate">
                {selectedFile ? (
                  <>
                    <span className="opacity-50 font-normal">
                      {selectedFile.split("/").slice(0, -1).join("/")}/
                    </span>
                    <span>{selectedFile.split("/").pop()}</span>
                  </>
                ) : (
                  <span>{repoTitle || displayName(repoName)}</span>
                )}
              </div>
              {isArchived && !selectedFile && (
                <Badge variant="neutral" size="sm" className="shrink-0">
                  Archived
                </Badge>
              )}
            </div>

            <div className="shrink-0 hidden sm:block">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>

          {!selectedFile && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {description && (
                <p className="text-sm text-text-secondary max-w-4xl leading-relaxed">
                  {description}
                </p>
              )}

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
                {/* Branch/Tag Selector */}
                <div className="relative w-full sm:w-auto" ref={viewMenuRef}>
                  <button
                    type="button"
                    className={`group w-full sm:w-64 flex items-center justify-between gap-2 px-3 py-2 bg-app-surface hover:bg-app-hover border border-app-border hover:border-app-border rounded-lg text-sm text-text-primary transition-all shadow-sm ${
                      isViewMenuOpen
                        ? "ring-2 ring-app-accent/20 border-app-accent"
                        : ""
                    }`}
                    onClick={() => setIsViewMenuOpen((v) => !v)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CodeBracketIcon className="w-4 h-4 text-text-tertiary group-hover:text-app-accent transition-colors" />
                      <span className="truncate font-medium">
                        {(() => {
                          const v = viewRef.trim();
                          if (!v) return currentBranch ?? "main";

                          const isSha = /^[0-9a-f]{40}$/i.test(v);
                          if (isSha) {
                            const commit = normalizedCommits.find(
                              (c) => c.hash.trim() === v,
                            );
                            if (commit) {
                              const short = v.slice(0, 7);
                              return `Commit: ${short}`;
                            }
                            return `Commit: ${v.slice(0, 7)}`;
                          }

                          return v;
                        })()}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${isViewMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isViewMenuOpen && (
                    <div
                      className="absolute z-50 mt-2 w-full sm:w-80 bg-app-bg border border-app-border rounded-xl shadow-xl overflow-hidden ring-1 ring-black/5"
                      role="menu"
                    >
                      <div className="p-2 border-b border-app-border">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                          <input
                            value={viewQuery}
                            onChange={(e) => setViewQuery(e.target.value)}
                            placeholder="Find a branch or commit..."
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 bg-app-surface border border-transparent focus:border-app-accent rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent transition-all"
                          />
                        </div>
                      </div>

                      <div className="max-h-[320px] overflow-auto py-1">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-app-accent/10 hover:text-app-accent flex items-center justify-between transition-colors"
                          onClick={() => {
                            setSelectedFile(null);
                            setViewRef("");
                            setIsViewMenuOpen(false);
                          }}
                        >
                          <span className="truncate font-medium">
                            {currentBranch ?? "main"}
                          </span>
                          {viewRef.trim() === "" && (
                            <CheckIcon className="w-4 h-4 text-app-accent" />
                          )}
                        </button>

                        {(() => {
                          const filteredBranches = normalizedBranches
                            .filter((b) => b !== (currentBranch ?? "").trim())
                            .filter(
                              (b) =>
                                !viewQuery.trim() ||
                                b
                                  .toLowerCase()
                                  .includes(viewQuery.trim().toLowerCase()),
                            );

                          if (filteredBranches.length > 0) {
                            return (
                              <>
                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-text-tertiary bg-app-surface/30 mt-1">
                                  Branches
                                </div>
                                {filteredBranches.map((b) => (
                                  <button
                                    key={`branch:${b}`}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-app-surface flex items-center justify-between transition-colors"
                                    onClick={() => {
                                      setSelectedFile(null);
                                      setViewRef(b);
                                      onChangeView(b);
                                      setIsViewMenuOpen(false);
                                    }}
                                  >
                                    <span className="truncate text-text-secondary hover:text-text-primary">
                                      {b}
                                    </span>
                                  </button>
                                ))}
                              </>
                            );
                          }
                          return null;
                        })()}

                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-text-tertiary bg-app-surface/30 mt-1">
                          Recent Commits
                        </div>

                        {normalizedCommits
                          .filter((c) => {
                            const q = viewQuery.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              c.hash.toLowerCase().includes(q) ||
                              (c.message ?? "").toLowerCase().includes(q) ||
                              (c.author ?? "").toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 50)
                          .map((c) => {
                            const full = c.hash.trim();
                            const short = full.slice(0, 7);
                            const msg = (c.message ?? "").trim();
                            const label = msg ? msg : `Commit ${short}`;

                            return (
                              <button
                                key={`commit:${full}`}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-app-surface group flex flex-col gap-0.5 transition-colors"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setViewRef(full);
                                  onChangeView(full);
                                  setIsViewMenuOpen(false);
                                }}
                              >
                                <span className="truncate text-text-primary w-full">
                                  {label}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] bg-app-surface px-1.5 py-0.5 rounded text-text-tertiary group-hover:text-app-accent group-hover:bg-app-accent/10 transition-colors">
                                    {short}
                                  </span>
                                  {c.author && (
                                    <span className="text-[10px] text-text-tertiary truncate max-w-[150px]">
                                      by {c.author}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Clone Dropdown */}
                  <div className="relative w-full sm:w-auto" ref={cloneMenuRef}>
                    <button
                      type="button"
                      className={`w-full sm:w-auto justify-center sm:justify-start flex items-center gap-2 px-4 py-2 bg-app-accent hover:bg-app-accent/90 text-text-on-accent rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-[0.98] ${isCloneMenuOpen ? "ring-2 ring-offset-2 ring-offset-app-bg ring-app-accent" : ""}`}
                      onClick={() => setIsCloneMenuOpen((v) => !v)}
                    >
                      <CodeBracketIcon className="w-4 h-4" />
                      <span>Clone</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform ${isCloneMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isCloneMenuOpen && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-80 bg-app-bg border border-app-border rounded-xl shadow-xl p-4 z-50 animate-fadeIn origin-top-left sm:origin-top-right">
                        <h4 className="text-sm font-semibold text-text-primary mb-3">
                          Clone repository
                        </h4>

                        <div className="space-y-4">
                          {httpAddress && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-text-secondary">
                                <span>HTTPS</span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  readOnly
                                  value={httpAddress}
                                  className="flex-1 min-w-0 bg-app-surface border border-app-border rounded-md px-2 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-app-accent"
                                />
                                <button
                                  onClick={() => handleCopy(httpAddress)}
                                  className="p-1.5 bg-app-surface hover:bg-app-hover border border-app-border rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Square2StackIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {sshAddress && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-text-secondary">
                                <span>SSH</span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  readOnly
                                  value={sshAddress}
                                  className="flex-1 min-w-0 bg-app-surface border border-app-border rounded-md px-2 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-app-accent"
                                />
                                <button
                                  onClick={() => handleCopy(sshAddress)}
                                  className="p-1.5 bg-app-surface hover:bg-app-hover border border-app-border rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Square2StackIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {copied && (
            <div className="fixed bottom-6 right-6 bg-app-surface border border-app-border px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-slideIn">
              <div className="bg-success/10 p-1 rounded-full">
                <CheckIcon className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Copied to clipboard!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex-1">
        <Suspense fallback={<RepoFileTreeLoading />}>
          <RepoFileTree
            key={`${repoName}:${viewRef.trim() || "default"}`}
            selectedRepo={repoName}
            fileTree={fileTree}
            branchOrCommit={viewRef}
            branches={branches}
            currentBranch={currentBranch}
            commits={commits}
            onSwitchBranch={setCurrentBranch}
            onSettingsClick={onSettingsClick}
          />
        </Suspense>
      </div>
    </div>
  );
};
