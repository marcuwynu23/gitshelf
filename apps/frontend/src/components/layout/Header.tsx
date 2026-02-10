import {
  Bars3Icon,
  BellIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAuthStore} from "~/stores/authStore";

import Logo from "~/assets/logo.svg";
import {SearchModal} from "../search/SearchModal";

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
  actions?: React.ReactNode;
  onMenuClick?: () => void;
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

export const Header: React.FC<HeaderProps> = ({
  user: propUser,
  actions,
  onMenuClick,
}) => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Use auth user if available, otherwise use prop
  const user = authUser || propUser;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/auth/login");
  };

  return (
    <header className="h-14 bg-app-surface border-b border-app-border flex items-center px-4 justify-between z-20 shadow-sm relative">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-1 text-text-secondary hover:text-text-primary rounded-md hover:bg-app-hover"
          onClick={onMenuClick}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <img src={Logo} alt="GitShelf" className="w-9 h-9" />

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-text-primary">
              GitShelf
            </span>
            <span className="hidden sm:inline-block text-[11px] text-text-secondary">
              Repository Management
            </span>
          </div>
        </Link>
      </div>

      {/* Right side: Actions, Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Custom Actions (e.g., Create Repository button) */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}

        {/* Global Search */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="h-8 w-40 lg:w-56 pl-8 pr-3 bg-app-bg border border-app-border rounded text-sm text-text-tertiary flex items-center hover:border-text-tertiary transition-colors text-left"
          >
            Search...
            <span className="ml-auto text-xs border border-app-border rounded px-1.5 py-0.5 text-text-tertiary">
              Ctrl K
            </span>
          </button>
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        </div>

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 hover:bg-app-hover rounded transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-text-primary rounded-full ring-2 ring-app-surface" />
            )}
          </button>
          {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute right-0 mt-1 w-80 bg-app-surface border border-app-border rounded shadow-lg z-50 max-h-96 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-text-secondary">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-80">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <BellIcon className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">
                      No notifications
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-app-border">
                    {notifications.slice(0, 5).map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-app-hover transition-colors ${!notification.read ? "bg-app-hover/30" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-1.5 rounded flex-shrink-0 ${!notification.read ? "bg-app-hover" : "bg-app-bg"}`}
                            >
                              <Icon
                                className={`w-4 h-4 ${!notification.read ? "text-text-primary" : "text-text-secondary"}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs ${!notification.read ? "font-semibold text-text-primary" : "font-medium text-text-secondary"} mb-1`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-text-secondary line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-text-tertiary">
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
                <div className="px-4 py-2 border-t border-app-border">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-between text-xs text-text-primary opacity-60 hover:opacity-100 hover:underline transition-all"
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
            className="flex items-center gap-2 p-1 hover:bg-app-hover rounded transition-colors"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-app-border"
              />
            ) : (
              <UserCircleIcon className="w-7 h-7 text-text-secondary" />
            )}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-48 sm:w-56 lg:w-64 bg-app-surface border border-app-border rounded shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-app-border min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.name || "User"}
                </p>
                <p
                  className="text-xs text-text-tertiary truncate"
                  title={authUser?.email || "user@example.com"}
                >
                  {authUser?.email || "user@example.com"}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-2 text-sm text-text-secondary hover:bg-app-hover transition-colors whitespace-nowrap"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-2 text-sm text-text-secondary hover:bg-app-hover transition-colors whitespace-nowrap"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-app-hover transition-colors whitespace-nowrap"
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
