import axios from "axios";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {MainLayout} from "~/components/layout/MainLayout";
import {useBranchStore} from "~/stores/branchStore";
import {useCommitStore} from "~/stores/commitStore";
import {BranchList} from "./components/BranchList";
import {CommitList} from "./components/CommitList";
import {RepoSettingsFooter} from "./components/RepoSettingsFooter";
import {RepoSettingsModal} from "./components/RepoSettingsModal";
import {RepoDetail} from "./RepoDetail";
import {CommandLineIcon, LinkIcon} from "@heroicons/react/24/outline";

interface RepoMetadata {
  title?: string;
  description?: string;
  archived?: boolean;
  sshAddress: string | null;
  httpAddress: string;
}

export const RepoDetailPage = () => {
  const {name} = useParams<{name: string}>();
  const navigate = useNavigate();
  const {commits, fetchCommits} = useCommitStore();
  const {branches, currentBranch, setCurrentBranch, fetchBranches} =
    useBranchStore();
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const repoName = name ? decodeURIComponent(name) : null;
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  };
  // Load commits and branches when repo is loaded
  useEffect(() => {
    if (repoName) {
      fetchCommits(repoName);
      fetchBranches(repoName);

      // Fetch repo metadata
      // API expects repo name with .git
      const repoNameWithGit = repoName.includes(".git")
        ? repoName
        : `${repoName}.git`;
      axios
        .get(`/api/repos/${encodeURIComponent(repoNameWithGit)}/metadata`)
        .then((res) => {
          setRepoMetadata(res.data);
        })
        .catch((err) => {
          // If metadata doesn't exist, that's okay
          if (err.response?.status !== 404) {
            console.error("Failed to fetch repo metadata:", err);
          }
        });
    }
  }, [repoName, fetchCommits, fetchBranches]);

  useEffect(() => {
    if (!repoName) {
      navigate("/");
    }
  }, [repoName, navigate]);

  if (!repoName) {
    return null;
  }

  const rightSidebar = (
    <div className="space-y-6">
      {/* Repo Info Section */}
      {(repoMetadata?.title || repoMetadata?.description) && (
        <div className="bg-app-surface rounded-lg">
          {repoMetadata.title && (
            <h3 className="text-lg font-semibold text-[#e8e8e8] mb-1">
              {repoMetadata.title}
            </h3>
          )}
          <hr className="border-app-border my-2" />
          {repoMetadata.description && (
            <p className="text-xs text-[#b0b0b0] whitespace-pre-wrap">
              {repoMetadata.description}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center justify-center gap-1 flex-shrink-0">
        {/* Copy Buttons */}
        {repoMetadata?.sshAddress && (
          <button
            title={repoMetadata.sshAddress}
            data-copy="ssh"
            className="inline-flex items-center justify-center gap-1.5 px-2 py-1 hover:bg-app-surface rounded border border-transparent hover:border-[#3d3d3d] transition-colors active:scale-[0.98]"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(repoMetadata.sshAddress!);
            }}
          >
            <CommandLineIcon className="w-4 h-4 text-[#808080] flex-shrink-0" />
            <span className="text-xs text-[#808080] font-medium hidden sm:inline">
              SSH
            </span>
          </button>
        )}
        {repoMetadata?.httpAddress && (
          <button
            title={repoMetadata.httpAddress}
            data-copy="http"
            className="inline-flex items-center justify-center gap-1.5 px-2 py-1 hover:bg-app-surface rounded border border-transparent hover:border-[#3d3d3d] transition-colors active:scale-[0.98]"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(repoMetadata.httpAddress!);
            }}
          >
            <LinkIcon className="w-4 h-4 text-[#808080] flex-shrink-0" />
            <span className="text-xs text-[#808080] font-medium hidden sm:inline">
              HTTPS
            </span>
          </button>
        )}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-app-surface border border-[#3d3d3d] px-4 py-2 rounded shadow-lg">
            <p className="text-sm text-[#e8e8e8]">Copied to clipboard!</p>
          </div>
        )}
      </div>

      <BranchList
        branches={branches}
        currentBranch={currentBranch || null}
        onSwitchBranch={() => fetchBranches(repoName)}
      />
      <CommitList commits={commits} />
    </div>
  );

  const rightSidebarFooter = (
    <RepoSettingsFooter onSettingsClick={() => setIsSettingsModalOpen(true)} />
  );

  return (
    <>
      <MainLayout
        activeSidebarItem="repos"
        rightSidebar={rightSidebar}
        rightSidebarFooter={rightSidebarFooter}
      >
        <RepoDetail
          repoName={repoName}
          repoTitle={repoMetadata?.title}
          isArchived={repoMetadata?.archived || false}
          branches={branches}
          currentBranch={currentBranch}
          setCurrentBranch={setCurrentBranch}
        />
      </MainLayout>

      <RepoSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        repoName={repoName}
        repoMetadata={repoMetadata}
        onMetadataUpdate={setRepoMetadata}
        isArchived={repoMetadata?.archived || false}
      />
    </>
  );
};
