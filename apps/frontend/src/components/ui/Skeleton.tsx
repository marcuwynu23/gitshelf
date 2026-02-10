import type {ReactNode} from "react";

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  children,
}) => {
  return (
    <div className={`skeleton-loading bg-app-border rounded ${className}`}>
      {children}
    </div>
  );
};

// Skeleton components for common patterns
export const SkeletonText: React.FC<{ className?: string }> = ({ className = "" }) => (
  <Skeleton className={`h-4 ${className}`} />
);

export const SkeletonTitle: React.FC<{ className?: string }> = ({ className = "" }) => (
  <Skeleton className={`h-6 ${className}`} />
);

export const SkeletonAvatar: React.FC<{ className?: string }> = ({ className = "" }) => (
  <Skeleton className={`h-8 w-8 rounded-full ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <Skeleton className={`h-24 ${className}`} />
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <Skeleton className={`h-8 w-20 ${className}`} />
);