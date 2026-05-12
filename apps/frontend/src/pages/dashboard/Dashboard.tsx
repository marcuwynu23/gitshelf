import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {Breadcrumbs, Badge, Button} from "~/components/ui";
import {DashboardSkeleton} from "./components/DashboardSkeleton";
import {ActivityList} from "./components/ActivityList";
import {useAuthStore} from "~/stores/authStore";
import {
  FolderIcon,
  CodeBracketIcon,
  ShareIcon,
  PlusIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalRepos: number;
  totalCommits: number;
  totalBranches: number;
  recentRepos: Array<{
    name: string;
    sshAddress: string | null;
    httpAddress: string;
    archived?: boolean;
    description?: string;
  }>;
  // recentActivity is removed from UI but kept in interface if needed by API
  recentActivity: Array<any>;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const {user} = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get<DashboardStats>("/api/dashboard");
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const displayName = (name: string) => name.replace(/\.git$/, "");
  const getRepoUrl = (name: string) =>
    `/repository/${encodeURIComponent(name)}`;

  const breadcrumbs = [
    {
      label: "Dashboard",
    },
  ];

  if (loading) {
    return (
      <MainLayout
        activeSidebarItem="dashboard"
        rightSidebar={<HelpSidebarContent />}
      >
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  if (error || !stats) {
    return (
      <MainLayout
        activeSidebarItem="dashboard"
        rightSidebar={<HelpSidebarContent />}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-error mb-4">
              {error || "Failed to load dashboard"}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      activeSidebarItem="dashboard"
      rightSidebar={<HelpSidebarContent />}
    >
      <div className="h-full flex flex-col gap-6 pb-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back, {user?.name || user?.username || "Developer"}!
            </h1>
            <p className="text-sm text-text-secondary">
              Here's what's happening with your projects today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Repositories */}
          <div className="bg-app-surface border border-app-border rounded-lg px-4 py-3 hover:border-text-primary/30 transition-colors flex items-center gap-3">
            <div className="p-1.5 bg-app-hover rounded-md">
              <FolderIcon className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Repositories</p>
              <p className="text-xl font-bold text-text-primary">
                {stats.totalRepos}
              </p>
            </div>
          </div>

          {/* Total Commits */}
          <div className="bg-app-surface border border-app-border rounded-lg px-4 py-3 hover:border-text-primary/30 transition-colors flex items-center gap-3">
            <div className="p-1.5 bg-app-hover rounded-md">
              <CodeBracketIcon className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Total Commits</p>
              <p className="text-xl font-bold text-text-primary">
                {stats.totalCommits.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Total Branches */}
          <div className="bg-app-surface border border-app-border rounded-lg px-4 py-3 hover:border-text-primary/30 transition-colors flex items-center gap-3">
            <div className="p-1.5 bg-app-hover rounded-md">
              <ShareIcon className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Branches</p>
              <p className="text-xl font-bold text-text-primary">
                {stats.totalBranches}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent Repositories */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Recent Repositories
              </h2>
              <Link
                to="/repositories"
                className="text-sm text-text-primary opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
              >
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {stats.recentRepos.length === 0 ? (
              <div className="bg-app-surface border border-app-border rounded-lg p-6 text-center">
                <FolderIcon className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                <h3 className="text-sm font-medium text-text-primary mb-1">
                  No repositories found
                </h3>
                <p className="text-xs text-text-tertiary mb-4">
                  Create your first repository to get started.
                </p>
                <Button size="sm" onClick={() => navigate("/repositories")}>
                  Create Repository
                </Button>
              </div>
            ) : (
              <div className="bg-app-surface border border-app-border rounded-lg divide-y divide-app-border">
                {stats.recentRepos.map((repo) => (
                  <Link
                    key={repo.name}
                    to={getRepoUrl(repo.name)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-app-hover transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <FolderIcon className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="text-sm font-medium text-text-primary truncate hover:underline">
                      {displayName(repo.name)}
                    </span>
                    {repo.archived && (
                      <Badge variant="neutral" size="sm">
                        Archived
                      </Badge>
                    )}
                    {repo.description && (
                      <span className="hidden md:inline text-xs text-text-tertiary truncate max-w-[30ch]">
                        {repo.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Actions & Activity */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-text-primary">
                Quick Actions
              </h2>
              <div className="bg-app-surface border border-app-border rounded-lg divide-y divide-app-border">
                <button
                  onClick={() => navigate("/repositories")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-hover transition-colors text-left group first:rounded-t-lg"
                >
                  <PlusIcon className="w-4 h-4 text-text-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    New Repository
                  </span>
                  <ArrowRightIcon className="w-3 h-3 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate("/help")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-hover transition-colors text-left group"
                >
                  <BookOpenIcon className="w-4 h-4 text-text-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    Documentation
                  </span>
                  <ArrowRightIcon className="w-3 h-3 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-hover transition-colors text-left group last:rounded-b-lg"
                >
                  <Cog6ToothIcon className="w-4 h-4 text-text-primary" />
                  <span className="text-sm font-medium text-text-primary">
                    Settings
                  </span>
                  <ArrowRightIcon className="w-3 h-3 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <ActivityList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
