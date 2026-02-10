import type {FC} from "react";

export const LoadingSkeleton: FC = () => (
  <div className="bg-app-surface border border-app-border rounded-lg overflow-hidden">
    <div className="animate-pulse">
      {/* Header-like row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-app-border/40 bg-app-surface/50">
        <div className="w-5 h-5 bg-text-tertiary/20 rounded shrink-0"></div>
        <div className="h-4 bg-text-tertiary/20 rounded w-1/4"></div>
      </div>

      {/* File rows */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-app-border/40 last:border-0"
        >
          <div className="w-5 h-5 bg-text-tertiary/10 rounded shrink-0"></div>
          <div
            className={`h-4 bg-text-tertiary/10 rounded ${i % 3 === 0 ? "w-1/3" : i % 3 === 1 ? "w-1/2" : "w-1/4"}`}
          ></div>
          <div className="h-4 bg-text-tertiary/10 rounded w-20 ml-auto opacity-50"></div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;
