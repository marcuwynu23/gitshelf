import {Skeleton} from "~/components/ui/Skeleton";

export const ActivitiesSkeleton = () => {
  return (
    <div className="h-full flex flex-col pb-2">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-16" />
        <span className="text-text-tertiary">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      <div className="bg-app-surface border border-app-border rounded-xl overflow-hidden mt-6">
        {Array.from({length: 5}).map((_, i) => (
          <div
            key={i}
            className="w-full flex items-start gap-4 p-4 border-b border-app-border last:border-0"
          >
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
