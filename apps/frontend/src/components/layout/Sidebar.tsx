import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ChevronLeftIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {AboutUs} from "~/pages/about/AboutUs";
import {Modal} from "~/components/ui";

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
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemClick,
  isOpen = false,
  onClose,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const location = useLocation();

  const getItemPath = (itemId: string): string => {
    switch (itemId) {
      case "dashboard":
        return "/dashboard";
      case "activities":
        return "/activities";
      case "repos":
        return "/repositories";
      case "settings":
        return "/settings";
      case "profile":
        return "/profile";
      case "help":
        return "/help";
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
        {
          id: "activities",
          label: "Activity",
          icon: ClockIcon,
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
        {
          id: "help",
          label: "Help",
          icon: QuestionMarkCircleIcon,
        },
        {
          id: "about",
          label: "About Us",
          icon: InformationCircleIcon,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`bg-app-surface  transition-all duration-300 flex flex-col z-40
          fixed inset-y-0 left-0 h-full md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-14" : "w-56"}
        `}
      >
        {/* Collapse Button */}
        <div className="h-14 flex items-center justify-end px-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-app-hover rounded transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <Bars3Icon className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className={groupIdx > 0 ? "mt-6" : ""}>
              {!collapsed && (
                <div className="px-4 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.id);
                  const itemPath = getItemPath(item.id);

                  if (item.id === "about") {
                    return (
                      <button
                        key={item.id}
                        onClick={() => setShowAboutModal(true)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors relative group text-text-secondary hover:text-text-primary hover:bg-app-hover`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                        {collapsed && (
                          <span className="absolute left-full ml-2 px-2 py-1.5 bg-app-surface text-text-primary text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={itemPath}
                      onClick={() => onItemClick?.(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors relative group ${
                        isActive
                          ? "text-app-accent bg-app-accent/10 "
                          : "text-text-secondary hover:text-text-primary hover:bg-app-hover"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1.5 bg-app-surface text-text-primary text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
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

      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title=""
        size="xl"
      >
        <AboutUs />
      </Modal>
    </>
  );
};
