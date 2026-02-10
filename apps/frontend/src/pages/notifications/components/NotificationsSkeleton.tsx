import {Skeleton, SkeletonText, SkeletonTitle} from "~/components/ui/Skeleton";

export const NotificationsSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-4">
        <SkeletonText className="h-4 w-24" />
      </div>

      {/* Page Header Skeleton */}
      <div className="mb-6">
        <SkeletonTitle className="w-32 mb-2" />
        <SkeletonText className="w-64" />
      </div>

      {/* Notifications Content Skeleton */}
      <div className="flex-1 overflow-auto">
        <div className="bg-app-surface border border-app-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <SkeletonTitle className="w-40" />
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="space-y-4">
            {Array.from({length: 5}).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 border border-app-border rounded-lg"
              >
                <div className="w-8 h-8 bg-app-border rounded-full opacity-50 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <SkeletonText className="w-3/4 h-4 mb-1" />
                      <SkeletonText className="w-1/2 h-3 mb-2" />
                      <SkeletonText className="w-full h-3 mb-1" />
                      <SkeletonText className="w-2/3 h-3" />
                    </div>
                    <SkeletonText className="w-16 h-3 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
