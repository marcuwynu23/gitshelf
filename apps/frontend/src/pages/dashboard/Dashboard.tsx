import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import {MainLayout} from "~/components/layout/MainLayout";
import {Breadcrumbs} from "~/components/ui";
import {
  FolderIcon,
  CodeBracketIcon,
  ClockIcon,
  UserIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalRepos: number;
  totalCommits: number;
  totalBranches: number;
  recentRepos: Array<{
    name: string;
    sshAddress: string | null;
    httpAddress: string;
  }>;
  recentActivity: Array<{
    repo: string;
    branch: string;
    lastCommit: {
      hash: string;
      message: string;
      author: string;
      date: string;
    } | null;
  }>;
}

export const Dashboard = () => {
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const breadcrumbs = [
    {
      label: "Dashboard",
    },
  ];

  if (loading) {
    return (
      <MainLayout activeSidebarItem="dashboard">
        <div className="h-full flex items-center justify-center">
          <p className="text-[#b0b0b0]">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !stats) {
    return (
      <MainLayout activeSidebarItem="dashboard">
        <div className="h-full flex items-center justify-center">
          <p className="text-error">{error || "Failed to load dashboard"}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeSidebarItem="dashboard">
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#e8e8e8] mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#b0b0b0]">
            Overview of your repositories and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total Repositories */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-app-accent/10 rounded">
                <FolderIcon className="w-5 h-5 text-app-accent" />
              </div>
              <div>
                <p className="text-xs text-[#808080] uppercase tracking-wider">
                  Repositories
                </p>
                <p className="text-2xl font-semibold text-[#e8e8e8]">
                  {stats.totalRepos}
                </p>
              </div>
            </div>
          </div>

          {/* Total Commits */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-app-accent/10 rounded">
                <CodeBracketIcon className="w-5 h-5 text-app-accent" />
              </div>
              <div>
                <p className="text-xs text-[#808080] uppercase tracking-wider">
                  Total Commits
                </p>
                <p className="text-2xl font-semibold text-[#e8e8e8]">
                  {stats.totalCommits.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Total Branches */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-app-accent/10 rounded">
                <ShareIcon className="w-5 h-5 text-app-accent" />
              </div>
              <div>
                <p className="text-xs text-[#808080] uppercase tracking-wider">
                  Branches
                </p>
                <p className="text-2xl font-semibold text-[#e8e8e8]">
                  {stats.totalBranches}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Recent Repositories */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e8e8e8]">
                Recent Repositories
              </h2>
              <Link
                to="/repositories"
                className="text-sm text-app-accent hover:text-[#5a95f5] transition-colors"
              >
                View all
              </Link>
            </div>
            {stats.recentRepos.length === 0 ? (
              <p className="text-[#808080] text-sm">No repositories found</p>
            ) : (
              <div className="space-y-2">
                {stats.recentRepos.map((repo) => (
                  <Link
                    key={repo.name}
                    to={getRepoUrl(repo.name)}
                    className="block p-3 rounded border border-transparent hover:bg-[#353535] hover:border-[#3d3d3d] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderIcon className="w-4 h-4 text-[#b0b0b0] flex-shrink-0" />
                      <span className="text-sm text-[#e8e8e8] truncate">
                        {displayName(repo.name)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">
              Recent Activity
            </h2>
            {stats.recentActivity.length === 0 ? (
              <p className="text-[#808080] text-sm">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, idx) => (
                  <div
                    key={`${activity.repo}-${idx}`}
                    className="p-3 rounded border border-[#3d3d3d] bg-app-bg"
                  >
                    {activity.lastCommit ? (
                      <>
                        <div className="flex items-start gap-3 mb-2">
                          <ClockIcon className="w-4 h-4 text-[#808080] mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#e8e8e8] mb-1 line-clamp-2">
                              {activity.lastCommit.message}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[#b0b0b0]">
                              <div className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                <span>{activity.lastCommit.author}</span>
                              </div>
                              <span className="font-mono text-app-accent">
                                {activity.lastCommit.hash.slice(0, 7)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#808080] mt-2 pt-2 border-t border-[#3d3d3d]">
                          <Link
                            to={getRepoUrl(activity.repo)}
                            className="hover:text-app-accent transition-colors"
                          >
                            {displayName(activity.repo)}
                          </Link>
                          <span>{formatDate(activity.lastCommit.date)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-4 h-4 text-[#808080] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-[#b0b0b0]">
                            No commits yet
                          </p>
                          <Link
                            to={getRepoUrl(activity.repo)}
                            className="text-xs text-app-accent hover:text-[#5a95f5] transition-colors mt-1 inline-block"
                          >
                            {displayName(activity.repo)}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
