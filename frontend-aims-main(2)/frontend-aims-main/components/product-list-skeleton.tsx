import { Skeleton } from "@/components/ui/skeleton"

export default function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
