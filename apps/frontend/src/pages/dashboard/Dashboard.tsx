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
      <div className="h-full flex flex-col gap-8 pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#e8e8e8]">
            Welcome back, {user?.name || user?.username || "Developer"}!
          </h1>
          <p className="text-[#b0b0b0]">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Repositories */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-xl p-5 hover:border-app-accent/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <FolderIcon className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-[#808080] bg-[#2a2a2a] px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <div>
              <p className="text-sm text-[#808080] mb-1">Repositories</p>
              <p className="text-3xl font-bold text-[#e8e8e8]">
                {stats.totalRepos}
              </p>
            </div>
          </div>

          {/* Total Commits */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-xl p-5 hover:border-app-accent/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <CodeBracketIcon className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-[#808080] bg-[#2a2a2a] px-2 py-1 rounded-full">
                All Time
              </span>
            </div>
            <div>
              <p className="text-sm text-[#808080] mb-1">Total Commits</p>
              <p className="text-3xl font-bold text-[#e8e8e8]">
                {stats.totalCommits.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Total Branches */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-xl p-5 hover:border-app-accent/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <ShareIcon className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs font-medium text-[#808080] bg-[#2a2a2a] px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <div>
              <p className="text-sm text-[#808080] mb-1">Branches</p>
              <p className="text-3xl font-bold text-[#e8e8e8]">
                {stats.totalBranches}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Repositories */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#e8e8e8]">
                Recent Repositories
              </h2>
              <Link
                to="/repositories"
                className="text-sm text-app-accent hover:text-[#5a95f5] transition-colors flex items-center gap-1"
              >
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {stats.recentRepos.length === 0 ? (
              <div className="bg-app-surface border border-[#3d3d3d] rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderIcon className="w-8 h-8 text-[#808080]" />
                </div>
                <h3 className="text-lg font-medium text-[#e8e8e8] mb-2">
                  No repositories found
                </h3>
                <p className="text-[#808080] mb-6 max-w-sm mx-auto">
                  Get started by creating your first repository to track your
                  code.
                </p>
                <Button onClick={() => navigate("/repositories")}>
                  Create Repository
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentRepos.map((repo) => (
                  <Link
                    key={repo.name}
                    to={getRepoUrl(repo.name)}
                    className="group bg-app-surface border border-[#3d3d3d] rounded-xl p-5 hover:border-app-accent/50 hover:shadow-lg hover:shadow-app-accent/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-[#2a2a2a] rounded-lg group-hover:bg-app-accent/10 transition-colors">
                        <FolderIcon className="w-5 h-5 text-[#b0b0b0] group-hover:text-app-accent transition-colors" />
                      </div>
                      {repo.archived && (
                        <Badge variant="neutral" size="sm">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#e8e8e8] mb-1 truncate group-hover:text-app-accent transition-colors">
                      {displayName(repo.name)}
                    </h3>
                    <p className="text-sm text-[#808080] line-clamp-2 h-10">
                      {repo.description || "No description provided."}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Actions & Activity */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold text-[#e8e8e8]">
                Quick Actions
              </h2>
              <div className="bg-app-surface border border-[#3d3d3d] rounded-xl p-1 overflow-hidden">
                <button
                  onClick={() => navigate("/repositories")}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#2a2a2a] transition-colors text-left group border-b border-[#3d3d3d] last:border-0"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#e8e8e8]">
                      New Repository
                    </h3>
                    <p className="text-xs text-[#808080]">
                      Create a new project
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-[#808080] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate("/help")}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#2a2a2a] transition-colors text-left group border-b border-[#3d3d3d] last:border-0"
                >
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
                    <BookOpenIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#e8e8e8]">
                      Documentation
                    </h3>
                    <p className="text-xs text-[#808080]">Learn how to use</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-[#808080] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#2a2a2a] transition-colors text-left group"
                >
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                    <Cog6ToothIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#e8e8e8]">Settings</h3>
                    <p className="text-xs text-[#808080]">
                      Manage your account
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-[#808080] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
