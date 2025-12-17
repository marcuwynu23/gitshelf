import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {MainLayout} from "~/components/layout/MainLayout";
import {Breadcrumbs, Button, Badge} from "~/components/ui";
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
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
        prev.map((notif) => (notif.id === id ? {...notif, read: true} : notif))
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
      <MainLayout activeSidebarItem="dashboard">
        <div className="h-full flex items-center justify-center">
          <p className="text-[#b0b0b0]">Loading notifications...</p>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#e8e8e8] mb-1">
              Notifications
            </h1>
            <p className="text-sm text-[#b0b0b0]">
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b border-[#3d3d3d]">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              filter === "all"
                ? "text-app-accent border-app-accent"
                : "text-[#b0b0b0] border-transparent hover:text-[#e8e8e8]"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              filter === "unread"
                ? "text-app-accent border-app-accent"
                : "text-[#b0b0b0] border-transparent hover:text-[#e8e8e8]"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-auto">
          {filteredNotifications.length === 0 ? (
            <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-12 text-center">
              <BellIcon className="w-12 h-12 text-[#808080] mx-auto mb-4" />
              <p className="text-[#b0b0b0] text-lg mb-2">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </p>
              <p className="text-[#808080] text-sm">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon =
                  notification.icon || getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`bg-app-surface border border-[#3d3d3d] rounded-lg p-4 transition-colors ${
                      !notification.read
                        ? "bg-app-accent/5 border-app-accent/30"
                        : "hover:bg-[#353535]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`p-2 rounded flex-shrink-0 ${
                          !notification.read ? "bg-app-accent/10" : "bg-app-bg"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            !notification.read
                              ? "text-app-accent"
                              : "text-[#b0b0b0]"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`text-sm font-medium ${
                                  !notification.read
                                    ? "text-[#e8e8e8]"
                                    : "text-[#b0b0b0]"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge variant="primary" size="sm">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#b0b0b0] mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[#808080]">
                              <ClockIcon className="w-3 h-3" />
                              <span>{formatTime(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {notification.link && (
                            <Link
                              to={notification.link}
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-app-accent hover:text-[#5a95f5] transition-colors"
                            >
                              View →
                            </Link>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-[#b0b0b0] hover:text-[#e8e8e8] transition-colors flex items-center gap-1"
                            >
                              <CheckIcon className="w-3 h-3" />
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-[#b0b0b0] hover:text-error transition-colors flex items-center gap-1 ml-auto"
                          >
                            <XMarkIcon className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
