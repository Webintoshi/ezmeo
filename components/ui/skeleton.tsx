import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        
        {/* Description */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        
        {/* Price and button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, ProductCardSkeleton }
