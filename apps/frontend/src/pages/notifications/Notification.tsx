import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {MainLayout} from "~/components/layout/MainLayout";
import {HelpSidebarContent} from "~/components/layout/HelpSidebar";
import {Breadcrumbs, Button} from "~/components/ui";
import {NotificationsSkeleton} from "./components/NotificationsSkeleton";
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  CodeBracketIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface NotificationItem {
  id: string;
  type: "commit" | "branch" | "repo" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  icon?: React.ComponentType<{className?: string}>;
}

export const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API endpoint
        // const res = await axios.get<NotificationItem[]>("/api/notifications");
        // setNotifications(res.data);

        // Mock data for now
        const mockNotifications: NotificationItem[] = [
          {
            id: "1",
            type: "commit",
            title: "New commit in repository",
            message: "New commit 'Initial commit' in my-repo",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            read: false,
            link: "/repository/my-repo.git",
            icon: CodeBracketIcon,
          },
          {
            id: "2",
            type: "branch",
            title: "New branch created",
            message: "Branch 'feature/new-feature' created in my-repo",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
            link: "/repository/my-repo.git",
            icon: ShareIcon,
          },
          {
            id: "3",
            type: "repo",
            title: "Repository updated",
            message: "Repository 'another-repo' has been updated",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: true,
            link: "/repository/another-repo.git",
            icon: CodeBracketIcon,
          },
          {
            id: "4",
            type: "system",
            title: "System notification",
            message: "Your account settings have been updated",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            read: true,
          },
        ];
        setNotifications(mockNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? {...notif, read: true} : notif)),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // await axios.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((notif) => ({...notif, read: true})));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await axios.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "commit":
        return CodeBracketIcon;
      case "branch":
        return ShareIcon;
      case "repo":
        return CodeBracketIcon;
      default:
        return BellIcon;
    }
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const breadcrumbs = [
    {
      label: "Notifications",
    },
  ];

  if (loading) {
    return (
      <MainLayout
        activeSidebarItem="notifications"
        rightSidebar={<HelpSidebarContent />}
      >
        <NotificationsSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      activeSidebarItem="dashboard"
      rightSidebar={<HelpSidebarContent />}
    >
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  Notifications
                </h2>
                <p className="text-sm text-text-secondary">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "All caught up!"}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="secondary" size="sm">
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={filter === "all" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
            </div>

            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-app-surface border border-app-border rounded-lg">
                  <BellIcon className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-text-primary mb-1">
                    No notifications
                  </h3>
                  <p className="text-text-secondary">
                    {filter === "unread"
                      ? "You have no unread notifications."
                      : "You have no notifications yet."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group relative flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      notif.read
                        ? "bg-app-surface border-app-border"
                        : "bg-app-accent/5 border-app-accent/20"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        notif.read
                          ? "bg-app-bg text-text-secondary"
                          : "bg-app-accent/10 text-app-accent"
                      }`}
                    >
                      {(() => {
                        const Icon = getNotificationIcon(notif.type);
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              notif.read
                                ? "text-text-primary"
                                : "text-text-primary font-semibold"
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <span className="text-xs text-text-tertiary whitespace-nowrap shrink-0">
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        {notif.link && (
                          <Link
                            to={notif.link}
                            className="text-xs font-medium text-app-accent hover:underline flex items-center gap-1"
                          >
                            View details
                            <ShareIcon className="w-3 h-3" />
                          </Link>
                        )}
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
                          >
                            <CheckIcon className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-xs font-medium text-text-tertiary hover:text-error flex items-center gap-1 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                        >
                          <XMarkIcon className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
