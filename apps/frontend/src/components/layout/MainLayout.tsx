import {useState, type ReactNode} from "react";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import {RightSidebar} from "./RightSidebar";

interface MainLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  rightSidebarFooter?: ReactNode;
  rightSidebarTitle?: string;
  activeSidebarItem?: string;
  onSidebarItemClick?: (itemId: string) => void;
  headerActions?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  rightSidebar,
  rightSidebarFooter,
  rightSidebarTitle,
  activeSidebarItem,
  onSidebarItemClick,
  headerActions,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      {/* Header */}
      <Header
        actions={headerActions}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          activeItem={activeSidebarItem}
          onItemClick={onSidebarItemClick}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-app-bg flex flex-col">
          <div className="px-4 py-6 w-full flex-1">{children}</div>
        </main>

        {/* Right Sidebar (Contextual) */}
        {rightSidebar && (
          <RightSidebar
            className="hidden lg:flex h-full"
            footer={rightSidebarFooter}
            title={rightSidebarTitle}
          >
            {rightSidebar}
          </RightSidebar>
        )}
      </div>
    </div>
  );
};
