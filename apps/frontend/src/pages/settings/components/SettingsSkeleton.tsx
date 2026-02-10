import {Skeleton, SkeletonText, SkeletonTitle} from "~/components/ui/Skeleton";
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

export const SettingsSkeleton = () => {
  const tabs = [
    {id: "general", label: "General", icon: UserIcon},
    {id: "notifications", label: "Notifications", icon: BellIcon},
    {id: "security", label: "Security", icon: ShieldCheckIcon},
    {id: "appearance", label: "Appearance", icon: PaintBrushIcon},
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-4">
        <SkeletonText className="h-4 w-16" />
      </div>

      {/* Page Header Skeleton */}
      <div className="mb-6">
        <SkeletonTitle className="w-24 mb-2" />
        <SkeletonText className="w-48" />
      </div>

      {/* Settings Content Skeleton */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-app-surface border border-app-border rounded-lg p-2">
              <nav className="space-y-1">
                {tabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded ${
                      index === 0
                        ? "bg-app-accent/10 border border-app-accent/30"
                        : ""
                    }`}
                  >
                    <div className="w-4 h-4 bg-text-tertiary rounded opacity-50" />
                    <SkeletonText className="flex-1 h-4" />
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Panel Skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-app-surface border border-app-border rounded-lg p-6">
              <SkeletonTitle className="w-32 mb-6" />

              {/* Form Fields Skeleton */}
              <div className="space-y-6">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i}>
                    <SkeletonText className="w-24 h-4 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}

                {/* Save Button Skeleton */}
                <div className="flex justify-end pt-4 border-t border-app-border">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
