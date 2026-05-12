import {SkeletonText, SkeletonTitle} from "~/components/ui/Skeleton";
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
    <div className="h-full flex flex-col gap-6 pb-6">
      {/* Breadcrumbs Skeleton */}
      <div>
        <SkeletonText className="h-4 w-20" />
      </div>

      {/* Welcome Section Skeleton */}
      <div>
        <SkeletonTitle className="w-64 h-7" />
        <SkeletonText className="w-72 mt-1" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[FolderIcon, CodeBracketIcon, ShareIcon].map((Icon, i) => (
          <div
            key={i}
            className="bg-app-surface border border-app-border rounded-lg px-4 py-3 flex items-center gap-3"
          >
            <div className="p-1.5 bg-app-hover rounded-md">
              <Icon className="w-5 h-5 text-text-primary opacity-50" />
            </div>
            <div>
              <SkeletonText className="w-16 h-3 mb-1" />
              <SkeletonTitle className="w-10 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Repositories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SkeletonTitle className="w-40 h-5" />
            <SkeletonText className="w-16 h-4" />
          </div>

          <div className="bg-app-surface border border-app-border rounded-lg divide-y divide-app-border">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <FolderIcon className="w-4 h-4 text-text-secondary opacity-50 shrink-0" />
                <SkeletonText className="w-32 h-4" />
                <SkeletonText className="hidden md:block w-48 h-3" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="flex flex-col gap-4">
          <SkeletonTitle className="w-28 h-5" />
          <div className="bg-app-surface border border-app-border rounded-lg divide-y divide-app-border">
            {[PlusIcon, BookOpenIcon, Cog6ToothIcon].map((Icon, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <Icon className="w-4 h-4 text-text-primary opacity-50" />
                <SkeletonText className="w-24 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
