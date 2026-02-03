import {Suspense, lazy, useEffect, useMemo, useState} from "react";
import {Breadcrumbs} from "~/components/ui";
import {Badge} from "~/components/ui/Badge";
import {useBranchStore} from "~/stores/branchStore";
import {useRepoStore} from "~/stores/repoStore";

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

  const [viewBranchOrCommit, setViewBranchOrCommit] = useState<string>("");

  const displayName = (name: string) => name.replace(/\.git$/, "");

  useEffect(() => {
    fetchBranches(repoName);
  }, [repoName, fetchBranches]);

  useEffect(() => {
    const ref = viewBranchOrCommit.trim();
    viewRepo(repoName, ref.length ? ref : undefined);
  }, [repoName, viewRepo, viewBranchOrCommit]);

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

    // Ensure currentBranch appears only once in the dropdown list
    add(currentBranch);
    (branches ?? []).forEach(add);

    // Sort but keep currentBranch first if present
    const curr = (currentBranch ?? "").trim();
    if (!curr) return list.sort((a, b) => a.localeCompare(b));

    const rest = list
      .filter((b) => b !== curr)
      .sort((a, b) => a.localeCompare(b));
    return [curr, ...rest];
  }, [branches, currentBranch]);

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

  const effectiveRef = viewBranchOrCommit.trim().length
    ? viewBranchOrCommit.trim()
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
                {effectiveRef && (
                  <p className="text-xs text-text-tertiary">
                    Viewing:{" "}
                    <span className="text-app-accent font-medium">
                      {effectiveRef}
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <label
                    className="text-xs text-text-tertiary"
                    htmlFor="branchSelect"
                  >
                    Branch:
                  </label>
                  <select
                    id="branchSelect"
                    className="text-xs bg-app-bg border border-app-border rounded px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-app-accent"
                    value={viewBranchOrCommit}
                    onChange={(e) => {
                      setSelectedFile(null);
                      setViewBranchOrCommit(e.target.value);
                    }}
                  >
                    <option value="">
                      Default ({currentBranch ?? "auto"})
                    </option>
                    {normalizedBranches
                      .filter((b) => b !== (currentBranch ?? "").trim())
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
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
          key={`${repoName}:${viewBranchOrCommit.trim() || "default"}`}
          selectedRepo={repoName}
          fileTree={fileTree}
          currentBranch={effectiveRef}
        />
      </Suspense>
    </div>
  );
};
