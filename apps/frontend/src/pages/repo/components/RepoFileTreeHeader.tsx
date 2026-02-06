import {
  CodeBracketIcon,
  CommandLineIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import type {FC} from "react";

export type PanelView = "files" | "readme" | "branches" | "commits";

type Props = {
  panelView: PanelView;
  setPanelView: (v: PanelView) => void;
  docTab: "readme" | "license";
  setDocTab: (t: "readme" | "license") => void;
  readmeFile: string | null;
  licenseFile: string | null;
  fileContent: Record<string, string>;
  fetchFileContent: (path: string) => Promise<void>;
  globalFetchedFiles: Record<string, boolean>;
  branchOrCommit?: string;
  onSettingsClick?: () => void;
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
  onSettingsClick,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-app-bg border-b border-app-border p-2">
      <div className="flex items-center w-full">
        <div className="flex flex-1 items-center gap-2 w-full">
          <button
            onClick={() => setPanelView("files")}
            aria-pressed={panelView === "files"}
            className={`flex flex-1 items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              panelView === "files"
                ? "bg-app-accent text-white shadow-sm"
                : "text-text-tertiary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <CodeBracketIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Codebase</span>
          </button>

          <button
            onClick={() => setPanelView("readme")}
            aria-pressed={panelView === "readme"}
            className={`flex flex-1 items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              panelView === "readme"
                ? "bg-app-accent text-white shadow-sm"
                : "text-text-tertiary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Documentation</span>
          </button>

          <button
            onClick={() => setPanelView("branches")}
            aria-pressed={panelView === "branches"}
            className={`flex flex-1 items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              panelView === "branches"
                ? "bg-app-accent text-white shadow-sm"
                : "text-text-tertiary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <ShareIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Branches</span>
          </button>

          <button
            onClick={() => setPanelView("commits")}
            aria-pressed={panelView === "commits"}
            className={`flex flex-1 items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              panelView === "commits"
                ? "bg-app-accent text-white shadow-sm"
                : "text-text-tertiary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <CommandLineIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Commits</span>
          </button>

          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="flex flex-1 items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-text-tertiary hover:text-text-primary hover:bg-white/3 whitespace-nowrap transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
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
