import {useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useBranchStore} from "~/stores/branchStore";
import {useCommitStore} from "~/stores/commitStore";
import {MainLayout} from "~/components/layout/MainLayout";
import {BranchList} from "./components/BranchList";
import {CommitList} from "./components/CommitList";
import {RepoDetail} from "./RepoDetail";

export const RepoDetailPage = () => {
  const {name} = useParams<{name: string}>();
  const navigate = useNavigate();
  const {commits, fetchCommits} = useCommitStore();
  const {branches, currentBranch, fetchBranches} = useBranchStore();

  const repoName = name ? decodeURIComponent(name) : null;

  // Load commits and branches when repo is loaded
  useEffect(() => {
    if (repoName) {
      fetchCommits(repoName);
      fetchBranches(repoName);
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
      <BranchList branches={branches} currentBranch={currentBranch || null} />
      <CommitList commits={commits} />
    </div>
  );

  return (
    <MainLayout activeSidebarItem="repos" rightSidebar={rightSidebar}>
      <RepoDetail repoName={repoName} />
    </MainLayout>
  );
};
