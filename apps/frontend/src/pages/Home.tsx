import {useEffect} from "react";
import {Page} from "@myapp/ui";
import {useBranchStore} from "~/stores/branchStore";
import {useCommitStore} from "~/stores/commitStore";
import {useRepoStore} from "~/stores/repoStore";
import {BranchList} from "./repo/components/BranchList";
import {CommitList} from "./repo/components/CommitList";
import {RepoFileTree} from "./repo/components/RepoFileTree";
import {RepoHeader} from "./repo/components/RepoHeader";
import {RepoList} from "./repo/components/RepoList";

const Home = () => {
  const {
    repos,
    repoName,
    setRepoName,
    fetchRepos,
    createRepo,
    viewRepo,
    fileTree,
    selectedRepo,
  } = useRepoStore();

  const {commits, fetchCommits} = useCommitStore();
  const {branches, currentBranch, fetchBranches} = useBranchStore();

  const loadRepoData = async (name: string) => {
    await viewRepo(name);
    await fetchCommits(name);
    await fetchBranches(name);
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <Page>
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <div className="border-b border-[#1f1f1f]">
          <RepoHeader
            repoName={repoName}
            setRepoName={setRepoName}
            createRepo={createRepo}
          />
        </div>

        {/* Main 3-column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Repo List */}
          <div className="w-1/5 bg-[#181818] border-r border-[#1f1f1f] overflow-auto p-4">
            <RepoList
              repos={repos}
              selectedRepo={selectedRepo}
              viewRepo={loadRepoData}
            />
          </div>

          {/* CENTER: File Tree + File Viewer */}
          <div
            className={`${
              selectedRepo ? "w-3/5" : "w-4/5"
            } bg-[#1f1f1f] overflow-auto p-2`}
          >
            {selectedRepo ? (
              <RepoFileTree
                selectedRepo={selectedRepo}
                fileTree={fileTree}
                currentBranch={currentBranch}
              />
            ) : (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-green-200">
                  Welcome to RepoHub!
                </h2>
                <p className="text-gray-100 mb-3">
                  RepoHub is a lightweight, self-hosted Git repository hub.
                </p>
                <p className="text-gray-100 mb-3">
                  It allows you to manage and explore repos easily.
                </p>
                <p className="text-gray-100 mb-3">Features:</p>
                <ul className="list-disc list-inside mb-3 text-gray-100 space-y-1">
                  <li>Browse repositories</li>
                  <li>View commits</li>
                  <li>Manage branches</li>
                  <li>Full privacy & control</li>
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT: Commits + Branches */}
          {selectedRepo && (
            <div className="w-1/5 bg-[#181818] border-l border-[#1f1f1f] overflow-auto p-4 flex flex-col">
              <BranchList branches={branches} currentBranch={currentBranch} />{" "}
              <CommitList commits={commits} />
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default Home;
