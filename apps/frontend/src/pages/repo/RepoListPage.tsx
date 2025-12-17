import {useEffect, useState} from "react";
import {useRepoStore} from "~/stores/repoStore";
import {MainLayout} from "~/components/layout/MainLayout";
import {RepoList} from "./components/RepoList";
import {Button, Input, Modal, Breadcrumbs} from "~/components/ui";

export const RepoListPage = () => {
  const {repos, setRepoName, fetchRepos, createRepo} = useRepoStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const handleCreateRepo = () => {
    if (newRepoName.trim()) {
      setRepoName(newRepoName.trim());
      createRepo();
      setNewRepoName("");
      setShowCreateModal(false);
    }
  };

  // Build breadcrumbs for repo list page
  const breadcrumbs = [
    {
      label: "Repositories",
    },
  ];

  return (
    <MainLayout
      activeSidebarItem="repos"
      headerActions={
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Create Repository</span>
          <span className="sm:hidden">Create</span>
        </Button>
      }
    >
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#e8e8e8] mb-1 truncate">
              Repositories
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-6">
            {/* Repo List Card */}
            <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
                All Repositories
              </h2>
              <RepoList repos={repos} selectedRepo={null} />
            </div>

            {/* Welcome Section */}
            <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4">
                Welcome to RepoHub
              </h2>
              <p className="text-[#b0b0b0] mb-4">
                RepoHub is a lightweight, self-hosted Git repository hub that
                allows you to manage and explore repositories easily.
              </p>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#e8e8e8] mb-2">
                  Features:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-[#b0b0b0] text-sm">
                  <li>Browse and manage Git repositories</li>
                  <li>View commit history and branch information</li>
                  <li>Explore file trees and view file contents</li>
                  <li>Full privacy and control over your code</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Repository Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewRepoName("");
        }}
        title="Create New Repository"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewRepoName("");
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRepo} className="w-full sm:w-auto">
              Create
            </Button>
          </>
        }
      >
        <Input
          label="Repository Name"
          placeholder="my-repository"
          value={newRepoName}
          onChange={(e) => setNewRepoName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateRepo();
            }
          }}
        />
      </Modal>
    </MainLayout>
  );
};
