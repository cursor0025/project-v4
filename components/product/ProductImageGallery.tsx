// components/product/ProductImageGallery.tsx

'use client'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export default function ProductImageGallery({
  images,
  name,
}: ProductImageGalleryProps) {
  const displayedImages = images?.slice(0, 5) ?? []

  if (!displayedImages.length) {
    return (
      <div className="aspect-square w-full max-w-md rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Aucune image disponible
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex-1">
        <div className="aspect-square w-full max-w-md overflow-hidden rounded-lg border bg-white">
          {/* Image principale = première */}
          {/* Remplace par ton composant Image si tu utilises next/image */}
          <img
            src={displayedImages[0]}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {displayedImages.length > 1 && (
        <div className="flex flex-row md:flex-col gap-2 md:w-24">
          {displayedImages.slice(1).map((img, index) => (
            <div
              key={img + index}
              className="aspect-square w-16 md:w-full overflow-hidden rounded-md border bg-white"
            >
              <img
                src={img}
                alt={`${name} ${index + 2}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
