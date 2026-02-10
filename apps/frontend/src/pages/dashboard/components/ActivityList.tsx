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
} from "@heroicons/react/24/outline";
import {useActivityStore} from "~/stores/activityStore";
import {SkeletonText, SkeletonTitle} from "~/components/ui/Skeleton";

export const ActivityList = () => {
  const {activities, fetchActivities, loading, error, markAsRead} =
    useActivityStore();

  useEffect(() => {
    fetchActivities(0, 5); // Fetch first 5 activities
  }, [fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PUSH":
      case "COMMIT":
        return <CodeBracketIcon className="w-4 h-4 text-text-primary" />;
      case "REPO_CREATE":
      case "BRANCH_CREATE":
        return <PlusIcon className="w-4 h-4 text-text-primary" />;
      case "REPO_DELETE":
      case "BRANCH_DELETE":
        return <TrashIcon className="w-4 h-4 text-text-primary" />;
      case "MEMBER_ADD":
        return <UserPlusIcon className="w-4 h-4 text-text-primary" />;
      default:
        return <CommandLineIcon className="w-4 h-4 text-text-primary" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    // You can customize this based on activity.data if needed
    return activity.title;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonTitle className="w-32" />
        <div className="bg-app-surface border border-app-border rounded-xl p-1 overflow-hidden">
          {Array.from({length: 3}).map((_, i) => (
            <div
              key={i}
              className="w-full flex items-center gap-4 p-4 border-b border-app-border last:border-0"
            >
              <div className="p-2 bg-app-hover rounded-lg">
                <SkeletonText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <SkeletonText className="w-32 h-4 mb-1" />
                <SkeletonText className="w-24 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-error p-4 bg-app-surface border border-app-border rounded-xl">
        Failed to load activity
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h2>
        <div className="bg-app-surface border border-app-border rounded-xl p-8 text-center">
          <p className="text-text-tertiary text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h2>
        <Link
          to="/activities"
          className="text-xs text-text-primary opacity-60 hover:opacity-100 hover:underline transition-opacity"
        >
          View all
        </Link>
      </div>

      <div className="bg-app-surface border border-app-border rounded-xl overflow-hidden">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className={`group w-full flex items-start gap-4 p-4 border-b border-app-border last:border-0 transition-colors hover:bg-app-hover ${
              !activity.read ? "bg-app-hover/30" : ""
            }`}
          >
            <div className="mt-0.5 p-2 bg-app-hover rounded-lg shrink-0">
              {getActivityIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm text-text-primary truncate pr-2 ${!activity.read ? "font-semibold" : "font-medium"}`}>
                  {getActivityMessage(activity)}
                </p>
                <span className="text-[10px] text-text-tertiary whitespace-nowrap shrink-0 mt-0.5">
                  {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                </span>
              </div>

              {activity.description && (
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {activity.description}
                </p>
              )}

              {activity.link && (
                <Link
                  to={activity.link}
                  className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-text-primary opacity-60 hover:opacity-100 hover:underline transition-opacity"
                  onClick={() => !activity.read && markAsRead(activity.id)}
                >
                  View details <ArrowRightIcon className="w-3 h-3" />
                </Link>
              )}
            </div>

            {!activity.read && (
              <div
                className="w-1.5 h-1.5 rounded-full bg-text-primary mt-2 shrink-0"
                title="Unread"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
