// components/ProductSkeleton.tsx
export default function ProductSkeleton() {
    return (
      <div className="bg-[#111827] rounded-3xl overflow-hidden border border-white/5 animate-pulse flex flex-col h-full">
        {/* Image Skeleton - ratio fixe */}
        <div className="aspect-square bg-gray-700 flex-shrink-0"></div>
        
        {/* Content Skeleton */}
        <div className="p-4 flex flex-col flex-1 space-y-3">
          {/* Title - HAUTEUR FIXE */}
          <div className="h-10 bg-gray-700 rounded"></div>
          
          {/* Rating - HAUTEUR FIXE */}
          <div className="flex items-center justify-between h-5">
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
          </div>
          
          {/* Price Section - HAUTEUR FIXE */}
          <div className="flex items-start justify-between pt-2 h-20">
            <div className="space-y-2 flex-1">
              <div className="h-8 w-28 bg-gray-700 rounded"></div>
              <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
          </div>
          
          {/* Button - mt-auto pour alignement */}
          <div className="h-12 bg-gray-700 rounded-2xl mt-auto"></div>
        </div>
      </div>
    );
  }
  