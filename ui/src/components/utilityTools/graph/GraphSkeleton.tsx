import { Skeleton } from "../../ui/skeleton";

export const GraphSkeleton = () => {
  return (
    <div className="relative w-full h-[600px] border border-border rounded-lg overflow-hidden bg-background p-4">
      <div className="flex flex-col gap-4 h-full">
        {/* Controls skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>

        {/* Graph area skeleton */}
        <div className="flex-1 flex items-center justify-center gap-8">
          {/* Mock nodes */}
          <div className="space-y-4">
            <Skeleton className="h-20 w-56 rounded-lg" />
            <Skeleton className="h-20 w-56 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-56 rounded-lg" />
            <Skeleton className="h-20 w-56 rounded-lg" />
            <Skeleton className="h-20 w-56 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-56 rounded-lg" />
            <Skeleton className="h-20 w-56 rounded-lg" />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Building relationship graph...
          </p>
        </div>
      </div>
    </div>
  );
};

