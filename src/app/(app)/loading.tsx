import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="surface-card rounded-card p-5 xl:col-span-2">
          <Skeleton className="mb-5 h-4 w-40" />
          <SkeletonChart className="h-56" />
        </div>
        <div className="surface-card rounded-card p-5">
          <Skeleton className="mb-5 h-4 w-32" />
          <Skeleton className="mx-auto size-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
