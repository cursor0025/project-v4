// components/ProductSkeleton.tsx
export default function ProductSkeleton() {
    return (
      <div className="bg-[#111827] rounded-3xl overflow-hidden border border-white/5 animate-pulse">
        {/* Image Skeleton */}
        <div className="aspect-square bg-gray-700"></div>
        
        {/* Content Skeleton */}
        <div className="p-5 space-y-3">
          {/* Title */}
          <div className="h-12 bg-gray-700 rounded"></div>
          
          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
            <div className="h-4 w-20 bg-gray-700 rounded"></div>
          </div>
          
          {/* Price */}
          <div className="flex items-start justify-between pt-2">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gray-700 rounded"></div>
              <div className="h-6 w-24 bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
          </div>
          
          {/* Button */}
          <div className="h-12 bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }
  