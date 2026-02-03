import {Suspense, lazy, useEffect, useMemo, useState} from "react";
import {Breadcrumbs} from "~/components/ui";
import {Badge} from "~/components/ui/Badge";
import {useBranchStore} from "~/stores/branchStore";
import {useRepoStore} from "~/stores/repoStore";
import {useCommitStore} from "~/stores/commitStore";

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
}

export const RepoDetail: React.FC<RepoDetailProps> = ({
  repoName,
  repoTitle,
  isArchived = false,
}) => {
  const {fileTree, selectedFile, setSelectedFile, viewRepo} = useRepoStore();
  const {branches, currentBranch, fetchBranches} = useBranchStore();
  const {commits, fetchCommits} = useCommitStore();

  const [viewRef, setViewRef] = useState<string>(""); // branch or commit hash; empty => default

  const displayName = (name: string) => name.replace(/\.git$/, "");

  useEffect(() => {
    fetchBranches(repoName);
    fetchCommits(repoName);
  }, [repoName, fetchBranches, fetchCommits]);

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
    const list = (commits ?? [])
      .filter((c) => c && typeof c.hash === "string" && c.hash.trim().length)
      .filter((c) => {
        const h = c.hash.trim();
        if (uniq.has(h)) return false;
        uniq.add(h);
        return true;
      })
      .slice(0, 50); // keep the dropdown usable

    return list;
  }, [commits]);

  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{label: string; href?: string; onClick?: () => void}> =
      [];

    crumbs.push({label: "Repositories", href: "/"});

    crumbs.push({
      label: displayName(repoName),
      onClick: selectedFile
        ? () => {
            setSelectedFile(null);
          }
        : undefined,
    });

    if (selectedFile) {
      const pathParts = selectedFile.split("/").filter(Boolean);
      pathParts.forEach((part, index) => {
        if (index < pathParts.length - 1) {
          crumbs.push({
            label: part,
            onClick: () => {
              setSelectedFile(null);
            },
          });
        } else {
          crumbs.push({label: part});
        }
      });
    }

    return crumbs;
  }, [repoName, selectedFile, setSelectedFile]);

  const shortRef = (ref: string) => {
    if (!ref) return ref;
    // shorten commit SHAs, leave branch names untouched
    return /^[0-9a-f]{40}$/i.test(ref) ? ref.slice(0, 7) : ref;
  };

  const effectiveRef = viewRef.trim().length
    ? viewRef.trim()
    : (currentBranch ?? "HEAD");

  return (
    <div className="h-full w-full flex flex-col px-4 sm:px-6 lg:px-8">
      <div className="sticky top-0 z-40 bg-app-bg border-b border-app-border py-3 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <p className="text-xl sm:text-lg font-bold">
                {selectedFile
                  ? selectedFile.split("/").pop() || selectedFile
                  : repoTitle}
              </p>
              {isArchived && !selectedFile && (
                <Badge variant="neutral" size="sm">
                  Archived
                </Badge>
              )}
            </div>

            {!selectedFile && (
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label
                    className="text-xs text-text-tertiary"
                    htmlFor="refSelect"
                  >
                    View
                  </label>
                  <select
                    id="refSelect"
                    className="text-xs bg-app-bg border border-app-border rounded px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-app-accent"
                    value={viewRef}
                    onChange={(e) => {
                      setSelectedFile(null);
                      setViewRef(e.target.value);
                    }}
                  >
                    <option value="">
                      Default ({currentBranch ?? "auto"})
                    </option>

                    <optgroup label="Branches">
                      {normalizedBranches
                        .filter((b) => b !== (currentBranch ?? "").trim())
                        .map((b) => (
                          <option key={`branch:${b}`} value={b}>
                            {b}
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="Commits">
                      {normalizedCommits.map((c) => {
                        const short = c.hash.trim().slice(0, 7);
                        const msg = (c.message ?? "").trim();
                        const date = (c.date ?? "").trim();
                        const label = [short, msg ? `— ${msg}` : ""]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <option
                            key={`commit:${c.hash}`}
                            value={c.hash.trim()}
                          >
                            {label}
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 ml-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      </div>

      <Suspense fallback={<RepoFileTreeLoading />}>
        <RepoFileTree
          key={`${repoName}:${viewRef.trim() || "default"}`}
          selectedRepo={repoName}
          fileTree={fileTree}
          currentBranch={effectiveRef}
        />
      </Suspense>
    </div>
  );
};
