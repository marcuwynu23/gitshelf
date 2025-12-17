import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: {
    name: string;
    avatar?: string;
  };
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({onSearch, user, actions}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
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
        <button
          className="relative p-1.5 hover:bg-[#353535] rounded transition-colors"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5 text-[#b0b0b0]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-app-accent rounded-full" />
        </button>

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
