import { Skeleton } from "@/components/ui/skeleton";

/** Grid of card-shaped skeletons for module listings. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => `skeleton-${i}`).map((id) => (
        <Skeleton key={id} className="h-48 rounded-2xl" />
      ))}
    </div>
  );
}
