import axios from "axios";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {useBranchStore} from "~/stores/branchStore";
import {useCommitStore} from "~/stores/commitStore";
import {RepoSettingsModal} from "./components/RepoSettingsModal";
import {RepoDetail} from "./RepoDetail";

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
  const {fetchCommits} = useCommitStore();
  const {branches, currentBranch, setCurrentBranch, fetchBranches} =
    useBranchStore();
  const [repoMetadata, setRepoMetadata] = useState<RepoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const repoName = name ? decodeURIComponent(name) : null;

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
      setLoading(true);
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
        })
        .finally(() => {
          setLoading(false);
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

  if (loading) {
    return (
      <MainLayout
        activeSidebarItem="repos"
        rightSidebar={<HelpSidebarContent />}
      >
        <RepoDetailSkeleton />
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout
        activeSidebarItem="repos"
        rightSidebar={<HelpSidebarContent />}
      >
        <RepoDetail
          repoName={repoName}
          repoTitle={repoMetadata?.title}
          isArchived={repoMetadata?.archived || false}
          description={repoMetadata?.description}
          sshAddress={repoMetadata?.sshAddress}
          httpAddress={repoMetadata?.httpAddress}
          branches={branches}
          currentBranch={currentBranch}
          setCurrentBranch={setCurrentBranch}
          className="h-auto lg:h-full"
          onSettingsClick={() => setIsSettingsModalOpen(true)}
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
