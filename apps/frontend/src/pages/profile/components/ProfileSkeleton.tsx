import {Skeleton, SkeletonText, SkeletonTitle} from "~/components/ui/Skeleton";

export const ProfileSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-4">
        <SkeletonText className="h-4 w-16" />
      </div>

      {/* Page Header Skeleton */}
      <div className="mb-6">
        <SkeletonTitle className="w-20 mb-2" />
        <SkeletonText className="w-56" />
      </div>

      {/* Profile Content Skeleton */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-app-surface border border-app-border rounded-lg p-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="w-20 h-20 rounded-full mb-4" />
                <SkeletonTitle className="w-24 mb-2" />
                <SkeletonText className="w-32" />
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-app-surface border border-app-border rounded-lg p-6">
              <SkeletonTitle className="w-32 mb-6" />

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <SkeletonText className="w-16 h-4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Email Field */}
                <div>
                  <SkeletonText className="w-12 h-4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Bio Field */}
                <div>
                  <SkeletonText className="w-8 h-4 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </div>

                {/* Avatar Field */}
                <div>
                  <SkeletonText className="w-20 h-4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Save Button */}
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
