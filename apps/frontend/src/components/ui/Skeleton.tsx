import {ReactNode} from "react";

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  children,
}) => {
  return (
    <div
      className={`animate-pulse bg-[#3d3d3d] rounded ${className}`}
      style={{
        background: 'linear-gradient(90deg, #3d3d3d 25%, #4a4a4a 50%, #3d3d3d 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
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