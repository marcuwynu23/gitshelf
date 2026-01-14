import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import {useBranchStore} from "~/stores/branchStore";
import {useCommitStore} from "~/stores/commitStore";
import {MainLayout} from "~/components/layout/MainLayout";
import {BranchList} from "./components/BranchList";
import {CommitList} from "./components/CommitList";
import {RepoDetail} from "./RepoDetail";
import {RepoSettingsFooter} from "./components/RepoSettingsFooter";
import {RepoSettingsModal} from "./components/RepoSettingsModal";

interface RepoMetadata {
  title?: string;
  description?: string;
}

export const RepoDetailPage = () => {
  const {name} = useParams<{name: string}>();
  const navigate = useNavigate();
  const {commits, fetchCommits} = useCommitStore();
  const {branches, currentBranch, fetchBranches} = useBranchStore();
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const repoName = name ? decodeURIComponent(name) : null;

  // Load commits and branches when repo is loaded
  useEffect(() => {
    if (repoName) {
      fetchCommits(repoName);
      fetchBranches(repoName);
      
      // Fetch repo metadata
      axios
        .get(`/api/repos/${encodeURIComponent(repoName)}/metadata`)
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
          <hr className="border-app-border my-2"/>
          {repoMetadata.description && (
            <p className="text-xs text-[#b0b0b0] whitespace-pre-wrap">
              {repoMetadata.description}
            </p>
          )}
        </div>
      )}
      <BranchList branches={branches} currentBranch={currentBranch || null} />
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
        <RepoDetail repoName={repoName} />
      </MainLayout>

      <RepoSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        repoName={repoName}
      />
    </>
  );
};
