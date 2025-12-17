import {useState, useEffect, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  CodeBracketIcon,
  ShareIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: {
    name: string;
    avatar?: string;
  };
  actions?: React.ReactNode;
}

interface NotificationItem {
  id: string;
  type: "commit" | "branch" | "repo" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export const Header: React.FC<HeaderProps> = ({onSearch, user, actions}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

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
          },
          {
            id: "2",
            type: "branch",
            title: "New branch created",
            message: "Branch 'feature/new-feature' created in my-repo",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
            link: "/repository/my-repo.git",
          },
        ];
        setNotifications(mockNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "commit":
        return CodeBracketIcon;
      case "branch":
        return ShareIcon;
      default:
        return BellIcon;
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API endpoint if it exists
      // await axios.post("/api/auth/logout");
    } catch (err) {
      // Even if logout API fails, continue with local cleanup
      console.error("Logout error:", err);
    } finally {
      // Clear any stored auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Close the menu
      setShowUserMenu(false);

      // Redirect to login page
      navigate("/auth/login");
    }
  };

  return (
    <header className="h-14 bg-app-surface border-b border-[#3d3d3d] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Logo */}
      <div className="flex flex-col flex-shrink-0">
        <h1 className="text-base font-semibold text-[#e8e8e8]">
          Repo<span className="text-app-accent">hub</span>
        </h1>
        <span className="hidden sm:inline text-xs text-[#808080]">
          Git Repository Manager
        </span>
      </div>

      {/* Right side: Actions, Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Custom Actions (e.g., Create Repository button) */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}

        {/* Global Search */}
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-40 lg:w-56 pl-8 pr-3 bg-app-bg border border-[#3d3d3d] rounded text-sm text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors"
          />
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
        </form>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 hover:bg-[#353535] rounded transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5 text-[#b0b0b0]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-app-accent rounded-full" />
            )}
          </button>
          {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute right-0 mt-1 w-80 bg-app-surface border border-[#3d3d3d] rounded shadow-lg z-50 max-h-96 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#3d3d3d] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#e8e8e8]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-[#b0b0b0]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-80">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <BellIcon className="w-8 h-8 text-[#808080] mx-auto mb-2" />
                    <p className="text-sm text-[#b0b0b0]">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#3d3d3d]">
                    {notifications.slice(0, 5).map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-[#353535] transition-colors ${
                            !notification.read ? "bg-app-accent/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-1.5 rounded flex-shrink-0 ${
                                !notification.read
                                  ? "bg-app-accent/10"
                                  : "bg-app-bg"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  !notification.read
                                    ? "text-app-accent"
                                    : "text-[#b0b0b0]"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-medium mb-1 ${
                                  !notification.read
                                    ? "text-[#e8e8e8]"
                                    : "text-[#b0b0b0]"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-[#b0b0b0] line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-[#808080]">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[#3d3d3d]">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-between text-xs text-app-accent hover:text-[#5a95f5] transition-colors"
                  >
                    <span>View all notifications</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 hover:bg-[#353535] rounded transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-[#3d3d3d]"
              />
            ) : (
              <UserCircleIcon className="w-7 h-7 text-[#b0b0b0]" />
            )}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-app-surface border border-[#3d3d3d] rounded shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-[#3d3d3d]">
                <p className="text-sm font-medium text-[#e8e8e8]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[#808080]">user@example.com</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-2 text-sm text-[#b0b0b0] hover:bg-[#353535] transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-2 text-sm text-[#b0b0b0] hover:bg-[#353535] transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-[#b0b0b0] hover:bg-[#353535] transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
