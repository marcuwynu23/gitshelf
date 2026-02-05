// RepoDetail.tsx
import {Suspense, lazy, useEffect, useMemo, useState} from "react";
import {Breadcrumbs} from "~/components/ui";
import {Badge} from "~/components/ui/Badge";
import {useCommitStore} from "~/stores/commitStore";
import {useRepoStore} from "~/stores/repoStore";
import {useCodeViewStore} from "~/stores/useCodeViewStore";
import {CommandLineIcon, LinkIcon} from "@heroicons/react/24/outline";

const RepoFileTree = lazy(() =>
  import("./components/RepoFileTree").then((module) => ({
    default: module.RepoFileTree,
  })),
);

const RepoFileTreeLoading = () => (
  <div className="flex-1 overflow-auto">
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-accent mx-auto mb-4"></div>
        <p className="text-sm text-[#b0b0b0]">Loading repository files...</p>
      </div>
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
  const [viewQuery, setViewQuery] = useState("");
  const {fileTree, selectedFile, setSelectedFile, viewRepo} = useRepoStore();
  const {commits, fetchCommits} = useCommitStore();
  const [copied, setCopied] = useState<string | null>(null);

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
      <div className="sticky top-0 z-20 bg-app-bg border-b border-app-border py-3 mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <p className="text-xl sm:text-lg font-bold truncate">
                {selectedFile
                  ? selectedFile.split("/").pop() || selectedFile
                  : repoTitle}
              </p>
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
            <div className="flex flex-col gap-4">
              {description && (
                <p className="text-sm text-[#b0b0b0] max-w-4xl whitespace-pre-wrap">
                  {description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                <div className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-[360px] max-w-full text-left text-xs bg-app-bg border border-app-border rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-app-accent flex items-center justify-between gap-2"
                    onClick={() => setIsViewMenuOpen((v) => !v)}
                  >
                    <span className="truncate">
                      {(() => {
                        const v = viewRef.trim();
                        if (!v) return ` (${currentBranch ?? "auto"})`;

                        const isSha = /^[0-9a-f]{40}$/i.test(v);
                        if (isSha) {
                          const commit = normalizedCommits.find(
                            (c) => c.hash.trim() === v,
                          );
                          if (commit) {
                            const short = v.slice(0, 7);
                            const msg = (commit.message ?? "").trim();
                            return msg ? `${short} — ${msg}` : short;
                          }
                          return v.slice(0, 7);
                        }

                        return v;
                      })()}
                    </span>

                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform ${isViewMenuOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isViewMenuOpen && (
                    <div
                      className="absolute z-50 mt-2 w-full sm:w-90 max-w-full bg-app-surface border border-app-border rounded-lg shadow-lg overflow-hidden"
                      role="menu"
                    >
                      <div className="p-2 border-b border-app-border">
                        <input
                          value={viewQuery}
                          onChange={(e) => setViewQuery(e.target.value)}
                          placeholder="Search branch or commit..."
                          className="w-full text-xs bg-app-bg border border-app-border rounded px-2 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-app-accent"
                        />
                      </div>

                      <div className="max-h-[320px] overflow-auto">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-app-bg/40 flex items-center justify-between"
                          onClick={() => {
                            setSelectedFile(null);
                            setViewRef("");
                            setIsViewMenuOpen(false);
                          }}
                        >
                          <span className="truncate">
                            ({currentBranch ?? "auto"})
                          </span>
                          {viewRef.trim() === "" && (
                            <span className="text-[10px] text-text-tertiary">
                              active
                            </span>
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

                          if (filteredBranches.length === 0) return null;

                          return (
                            <>
                              <div className="px-3 py-2 text-[10px] uppercase tracking-wide text-text-tertiary">
                                Branches
                              </div>
                              {filteredBranches.map((b) => (
                                <button
                                  key={`branch:${b}`}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-app-bg/40 flex items-center justify-between"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setViewRef(b);
                                    onChangeView(b);
                                    setIsViewMenuOpen(false);
                                  }}
                                >
                                  <span className="truncate">{b}</span>
                                </button>
                              ))}
                            </>
                          );
                        })()}

                        <div className="px-3 py-2 text-[10px] uppercase tracking-wide text-text-tertiary border-t border-app-border">
                          Commits
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
                            const label = msg ? `${short} — ${msg}` : short;

                            return (
                              <button
                                key={`commit:${full}`}
                                type="button"
                                className="w-full text-left px-3 py-2 text-xs hover:bg-app-bg/40 flex items-center justify-between"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setViewRef(full);
                                  onChangeView(full);
                                  setIsViewMenuOpen(false);
                                }}
                              >
                                <span className="truncate">{label}</span>
                                <span className="text-[10px] text-text-tertiary">
                                  {short}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {sshAddress && (
                    <button
                      title={sshAddress}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-app-bg hover:bg-app-surface rounded border border-app-border transition-colors active:scale-[0.98]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(sshAddress);
                      }}
                    >
                      <CommandLineIcon className="w-4 h-4 text-text-secondary" />
                      <span className="text-xs text-text-secondary font-medium">
                        SSH
                      </span>
                    </button>
                  )}
                  {httpAddress && (
                    <button
                      title={httpAddress}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-app-bg hover:bg-app-surface rounded border border-app-border transition-colors active:scale-[0.98]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(httpAddress);
                      }}
                    >
                      <LinkIcon className="w-4 h-4 text-text-secondary" />
                      <span className="text-xs text-text-secondary font-medium">
                        HTTPS
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {copied && (
            <div className="fixed bottom-4 right-4 bg-app-surface border border-[#3d3d3d] px-4 py-2 rounded shadow-lg z-50">
              <p className="text-sm text-[#e8e8e8]">Copied to clipboard!</p>
            </div>
          )}
        </div>
      </div>

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
  );
};
