import {Skeleton} from "~/components/ui/Skeleton";

export const RepoListSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length: 6}).map((_, i) => (
            <div
              key={i}
              className="bg-app-surface border border-app-border rounded-xl p-5 h-40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-app-border/50">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
