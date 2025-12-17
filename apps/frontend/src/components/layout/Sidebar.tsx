import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ChevronLeftIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{className?: string}>;
  href?: string;
  onClick?: () => void;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({activeItem, onItemClick}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getItemPath = (itemId: string): string => {
    switch (itemId) {
      case "dashboard":
        return "/dashboard";
      case "repos":
        return "/repositories";
      case "settings":
        return "/settings";
      case "profile":
        return "/profile";
      default:
        return "/";
    }
  };

  const isItemActive = (itemId: string): boolean => {
    if (activeItem) {
      return activeItem === itemId;
    }
    const itemPath = getItemPath(itemId);
    return (
      location.pathname === itemPath ||
      location.pathname.startsWith(itemPath + "/")
    );
  };

  const groups: SidebarGroup[] = [
    {
      label: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: HomeIcon,
        },
      ],
    },
    {
      label: "Repositories",
      items: [
        {
          id: "repos",
          label: "Repositories",
          icon: FolderIcon,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          id: "profile",
          label: "Profile",
          icon: UserIcon,
        },
        {
          id: "settings",
          label: "Settings",
          icon: Cog6ToothIcon,
        },
      ],
    },
  ];

  return (
    <div
      className={`bg-app-surface border-r border-[#3d3d3d] transition-all duration-300 flex flex-col ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Collapse Button */}
      <div className="h-14 flex items-center justify-end px-4 border-b border-[#3d3d3d]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-[#353535] rounded transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <Bars3Icon className="w-5 h-5 text-[#b0b0b0]" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-[#b0b0b0]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx > 0 ? "mt-6" : ""}>
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#808080]">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.id);
                const itemPath = getItemPath(item.id);
                return (
                  <Link
                    key={item.id}
                    to={itemPath}
                    onClick={() => onItemClick?.(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors relative group ${
                      isActive
                        ? "text-app-accent bg-app-accent/10 border-l-2 border-app-accent"
                        : "text-[#b0b0b0] hover:text-[#e8e8e8] hover:bg-[#353535]"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {collapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1.5 bg-app-surface border border-[#3d3d3d] text-[#e8e8e8] text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};
