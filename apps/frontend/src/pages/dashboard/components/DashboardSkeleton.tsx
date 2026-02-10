import {
  SkeletonCard,
  SkeletonText,
  SkeletonTitle,
} from "~/components/ui/Skeleton";
import {
  FolderIcon,
  CodeBracketIcon,
  ShareIcon,
  PlusIcon,
  BookOpenIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export const DashboardSkeleton = () => {
  return (
    <div className="h-full flex flex-col gap-8 pb-8">
      {/* Breadcrumbs Skeleton */}
      <div>
        <SkeletonText className="h-4 w-20" />
      </div>

      {/* Welcome Section Skeleton */}
      <div className="flex flex-col gap-2">
        <SkeletonTitle className="w-64 h-8" />
        <SkeletonText className="w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[FolderIcon, CodeBracketIcon, ShareIcon].map((Icon, i) => (
          <div
            key={i}
            className="bg-app-surface border border-app-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-app-hover rounded-lg">
                <Icon className="w-6 h-6 text-text-primary opacity-50" />
              </div>
              <SkeletonText className="w-10 h-5 rounded-full" />
            </div>
            <div>
              <SkeletonText className="w-20 h-4 mb-2" />
              <SkeletonTitle className="w-12 h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Repositories */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <SkeletonTitle className="w-40" />
            <SkeletonText className="w-16" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({length: 4}).map((_, i) => (
              <div
                key={i}
                className="bg-app-surface border border-app-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-app-bg rounded-lg">
                    <FolderIcon className="w-5 h-5 text-text-secondary opacity-50" />
                  </div>
                  {i === 1 && (
                    <SkeletonText className="w-16 h-5 rounded-full" />
                  )}
                </div>
                <SkeletonTitle className="w-3/4 mb-2" />
                <SkeletonText className="w-full h-4 mb-1" />
                <SkeletonText className="w-2/3 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="flex flex-col gap-6">
          <SkeletonTitle className="w-32" />
          <div className="bg-app-surface border border-app-border rounded-xl p-1 overflow-hidden">
            {[PlusIcon, BookOpenIcon, Cog6ToothIcon].map((Icon, i) => (
              <div
                key={i}
                className="w-full flex items-center gap-4 p-4 border-b border-app-border last:border-0"
              >
                <div className="p-2 bg-app-hover rounded-lg">
                  <Icon className="w-5 h-5 text-text-primary opacity-50" />
                </div>
                <div className="flex-1">
                  <SkeletonText className="w-24 h-4 mb-1" />
                  <SkeletonText className="w-32 h-3" />
                </div>
              </div>
            ))}
          </div>

          {/* Tip Card Skeleton */}
          <div className="bg-app-surface border border-app-border rounded-xl p-5">
            <SkeletonTitle className="w-24 mb-2" />
            <SkeletonText className="w-full h-12 mb-4" />
            <SkeletonCard className="w-24 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};
