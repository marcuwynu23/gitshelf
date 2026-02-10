import {Skeleton} from "~/components/ui/Skeleton";

export const RepoDetailSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-app-border bg-app-surface pb-4">
        <div className="mb-4">
           <Skeleton className="h-4 w-48 mb-4" />
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex flex-col gap-1">
                 <Skeleton className="h-6 w-48" />
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <Skeleton className="h-9 w-32 rounded-lg" />
               <Skeleton className="h-9 w-24 rounded-lg" />
               <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="flex items-center gap-6 mt-4">
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Content Skeleton (File Tree) */}
      <div className="flex-1 py-6">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <Skeleton className="h-9 w-40 rounded-lg" />
               <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
               <Skeleton className="h-9 w-32 rounded-lg" />
               <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
         </div>
         
         <div className="bg-app-surface border border-app-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-app-border bg-app-subtle">
               <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-4 w-32" />
               </div>
               <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
               </div>
            </div>
            
            {Array.from({length: 8}).map((_, i) => (
               <div key={i} className="flex items-center px-4 py-3 border-b border-app-border last:border-0">
                  <Skeleton className="w-5 h-5 rounded mr-3" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32 ml-auto" />
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
