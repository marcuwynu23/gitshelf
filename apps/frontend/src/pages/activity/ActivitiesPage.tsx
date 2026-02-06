import {useEffect} from "react";
import {format} from "date-fns";
import {Link} from "react-router-dom";
import {
  CodeBracketIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  CommandLineIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {Breadcrumbs, Button} from "~/components/ui";
import {useActivityStore} from "~/stores/activityStore";
import {SkeletonText} from "~/components/ui/Skeleton";

export const ActivitiesPage = () => {
  const {
    activities,
    fetchActivities,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    hasMore,
    page,
  } = useActivityStore();

  useEffect(() => {
    // Initial fetch if empty or just refresh
    fetchActivities(0, 20);
  }, [fetchActivities]);

  const handleLoadMore = () => {
    fetchActivities(page + 1, 20);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PUSH":
      case "COMMIT":
        return <CodeBracketIcon className="w-5 h-5 text-purple-400" />;
      case "REPO_CREATE":
      case "BRANCH_CREATE":
        return <PlusIcon className="w-5 h-5 text-green-400" />;
      case "REPO_DELETE":
      case "BRANCH_DELETE":
        return <TrashIcon className="w-5 h-5 text-red-400" />;
      case "MEMBER_ADD":
        return <UserPlusIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <CommandLineIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    return activity.title;
  };

  const breadcrumbs = [
    {
      label: "Activity",
    },
  ];

  return (
    <MainLayout
      activeSidebarItem="activities"
      rightSidebar={<HelpSidebarContent />}
    >
      <div className="h-full flex flex-col gap-8 pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-[#e8e8e8]">
                Activity Log
              </h1>
              <p className="text-[#b0b0b0]">
                Track all actions and updates across your repositories.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Mark all as read
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {activities.length === 0 && !loading ? (
            <div className="bg-app-surface border border-[#3d3d3d] rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                <CommandLineIcon className="w-8 h-8 text-[#808080]" />
              </div>
              <h3 className="text-lg font-medium text-[#e8e8e8] mb-2">
                No activity yet
              </h3>
              <p className="text-[#808080]">
                Your recent actions will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-app-surface border border-[#3d3d3d] rounded-xl overflow-hidden">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`group w-full flex items-start gap-4 p-4 border-b border-[#3d3d3d] last:border-0 transition-colors hover:bg-white/5 ${
                      !activity.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="mt-1 p-2 bg-[#2a2a2a] rounded-lg shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-base font-medium text-[#e8e8e8] truncate pr-2">
                          {getActivityMessage(activity)}
                        </p>
                        <span className="text-xs text-[#808080] whitespace-nowrap shrink-0 mt-0.5">
                          {format(
                            new Date(activity.createdAt),
                            "MMM d, yyyy h:mm a",
                          )}
                        </span>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-[#b0b0b0] mt-1">
                          {activity.description}
                        </p>
                      )}

                      {activity.link && (
                        <Link
                          to={activity.link}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-app-accent hover:underline"
                          onClick={() =>
                            !activity.read && markAsRead(activity.id)
                          }
                        >
                          View details <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {!activity.read && (
                      <div
                        className="w-2.5 h-2.5 rounded-full bg-app-accent mt-2.5 shrink-0"
                        title="Unread"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Loading Skeleton for initial load or load more */}
              {loading && (
                <div className="bg-app-surface border border-[#3d3d3d] rounded-xl overflow-hidden mt-4">
                  {Array.from({length: 3}).map((_, i) => (
                    <div
                      key={i}
                      className="w-full flex items-center gap-4 p-4 border-b border-[#3d3d3d] last:border-0"
                    >
                      <div className="p-2 bg-white/5 rounded-lg">
                        <SkeletonText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <SkeletonText className="w-48 h-5 mb-2" />
                        <SkeletonText className="w-32 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="flex justify-center pt-4 pb-8">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
