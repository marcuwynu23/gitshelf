import { SkeletonCard,SkeletonText, SkeletonTitle} from "~/components/ui/Skeleton";
import {
  FolderIcon,
  CodeBracketIcon,
  ClockIcon,
  UserIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

export const DashboardSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-4">
        <SkeletonText className="h-4 w-20" />
      </div>

      {/* Page Header Skeleton */}
      <div className="mb-6">
        <SkeletonTitle className="w-32 mb-2" />
        <SkeletonText className="w-64" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Repositories */}
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-app-accent/10 rounded">
              <FolderIcon className="w-5 h-5 text-app-accent opacity-50" />
            </div>
            <div>
              <SkeletonText className="w-16 h-3 mb-1" />
              <SkeletonTitle className="w-8" />
            </div>
          </div>
        </div>

        {/* Total Commits */}
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-app-accent/10 rounded">
              <CodeBracketIcon className="w-5 h-5 text-app-accent opacity-50" />
            </div>
            <div>
              <SkeletonText className="w-20 h-3 mb-1" />
              <SkeletonTitle className="w-12" />
            </div>
          </div>
        </div>

        {/* Total Branches */}
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-app-accent/10 rounded">
              <ShareIcon className="w-5 h-5 text-app-accent opacity-50" />
            </div>
            <div>
              <SkeletonText className="w-16 h-3 mb-1" />
              <SkeletonTitle className="w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Recent Repositories Skeleton */}
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <SkeletonTitle className="w-40" />
            <SkeletonText className="w-12" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded border border-[#3d3d3d] bg-app-bg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#3d3d3d] rounded opacity-50 flex-shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <SkeletonText className="flex-1 h-4" />
                    {i === 0 && <SkeletonCard className="w-16 h-5 rounded" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-6">
          <SkeletonTitle className="w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded border border-[#3d3d3d] bg-app-bg">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-4 h-4 bg-[#808080] rounded opacity-50 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <SkeletonText className="w-full h-4 mb-2" />
                    <SkeletonText className="w-3/4 h-3 mb-1" />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#808080] rounded opacity-50" />
                        <SkeletonText className="w-16 h-3" />
                      </div>
                      <SkeletonText className="w-12 h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3d3d3d]">
                  <SkeletonText className="w-20 h-3" />
                  <SkeletonText className="w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};