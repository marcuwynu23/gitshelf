import type { FC } from "react";

export const LoadingSkeleton: FC = () => (
  <div className="bg-app-surface border border-app-border rounded-lg p-6">
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-white/10 rounded w-1/3"></div>
      <div className="h-3 bg-white/6 rounded w-3/4"></div>
      <div className="h-3 bg-white/6 rounded w-2/3"></div>
      <div className="h-3 bg-white/6 rounded w-1/2"></div>
    </div>
  </div>
);

export default LoadingSkeleton;
