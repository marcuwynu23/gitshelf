import {useEffect, useState, useMemo} from "react";
import {useRepoStore} from "~/stores/repoStore";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {RepoList} from "./components/RepoList";
import {Button, Input, Modal, Breadcrumbs} from "~/components/ui";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";

export const RepoListPage = () => {
  const {repos, setRepoName, fetchRepos, createRepo} = useRepoStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoTitle, setNewRepoTitle] = useState("");
  const [newRepoDescription, setNewRepoDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived"
  >("all");

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch = (repo.title || repo.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "archived"
            ? repo.archived
            : !repo.archived;

      return matchesSearch && matchesFilter;
    });
  }, [repos, searchQuery, filterStatus]);

  const handleCreateRepo = () => {
    if (newRepoName.trim()) {
      setRepoName(newRepoName.trim());
      createRepo(
        newRepoTitle.trim() || undefined,
        newRepoDescription.trim() || undefined,
      );
      setNewRepoName("");
      setNewRepoTitle("");
      setNewRepoDescription("");
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
      rightSidebar={<HelpSidebarContent />}
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-[#e8e8e8]">
                All Repositories
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full sm:w-64 pl-9 pr-3 bg-app-bg border border-[#3d3d3d] rounded text-sm text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center bg-app-bg border border-[#3d3d3d] rounded p-1">
                  {(["all", "active", "archived"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors capitalize ${
                        filterStatus === status
                          ? "bg-app-accent/20 text-app-accent"
                          : "text-[#808080] hover:text-[#e8e8e8]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <RepoList repos={filteredRepos} selectedRepo={null} />
          </div>
        </div>
      </div>

      {/* Create Repository Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewRepoName("");
          setNewRepoTitle("");
          setNewRepoDescription("");
        }}
        title="Create New Repository"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewRepoName("");
                setNewRepoTitle("");
                setNewRepoDescription("");
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
        <div className="space-y-4">
          <Input
            label="Repository Name"
            placeholder="my-repository"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
            required
          />
          <Input
            label="Title (optional)"
            placeholder="My Awesome Repository"
            value={newRepoTitle}
            onChange={(e) => setNewRepoTitle(e.target.value)}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-[#e8e8e8] mb-1.5">
              Description (optional)
            </label>
            <textarea
              className="h-20 w-full px-3 py-2 bg-app-surface border border-[#3d3d3d] rounded text-sm text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors resize-none"
              placeholder="A brief description of your repository"
              value={newRepoDescription}
              onChange={(e) => setNewRepoDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
