import {CodeBracketIcon, DocumentTextIcon} from "@heroicons/react/24/outline";
import type {FC} from "react";

type Props = {
  panelView: "files" | "readme";
  setPanelView: (v: "files" | "readme") => void;
  docTab: "readme" | "license";
  setDocTab: (t: "readme" | "license") => void;
  readmeFile: string | null;
  licenseFile: string | null;
  fileContent: Record<string, string>;
  fetchFileContent: (path: string) => Promise<void>;
  globalFetchedFiles: Record<string, boolean>;
  branchOrCommit?: string;
};

export const RepoFileTreeHeader: FC<Props> = ({
  panelView,
  setPanelView,
  docTab,
  setDocTab,
  readmeFile,
  licenseFile,
  fileContent,
  fetchFileContent,
  globalFetchedFiles,
}) => {
  return (
    <div className="sticky top-0 z-20  border-b border-app-border py-2 pr-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPanelView("files")}
            aria-pressed={panelView === "files"}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              panelView === "files"
                ? "bg-blue-500  text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-primary hover:bg-white/3"
            }`}
          >
            <CodeBracketIcon className="w-4 h-4" />
            <span>Codebase</span>
          </button>

          <button
            onClick={() => setPanelView("readme")}
            aria-pressed={panelView === "readme"}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              panelView === "readme"
                ? "bg-blue-500  text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-primary hover:bg-white/3"
            }`}
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Documentation</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* subtle helper area (could hold repo actions) */}
        </div>
      </div>

      {panelView === "readme" && (readmeFile || licenseFile) && (
        <div className="mt-3 flex items-center gap-4">
          {readmeFile && (
            <button
              onClick={async () => {
                setDocTab("readme");
                if (
                  readmeFile &&
                  !fileContent[readmeFile] &&
                  !globalFetchedFiles[readmeFile]
                ) {
                  try {
                    await fetchFileContent(readmeFile);
                  } catch {
                    /* fetch failed; allow retry */
                  }
                }
              }}
              className={`text-sm font-medium transition-colors ${
                docTab === "readme"
                  ? "border-b-2 border-app-accent text-text-primary pb-1"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              README
            </button>
          )}

          {licenseFile && (
            <button
              onClick={async () => {
                setDocTab("license");
                if (
                  licenseFile &&
                  !fileContent[licenseFile] &&
                  !globalFetchedFiles[licenseFile]
                ) {
                  try {
                    await fetchFileContent(licenseFile);
                  } catch {
                    /* fetch failed; allow retry */
                  }
                }
              }}
              className={`text-sm font-medium transition-colors ${
                docTab === "license"
                  ? "border-b-2 border-app-accent text-text-primary pb-1"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              LICENSE
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RepoFileTreeHeader;
