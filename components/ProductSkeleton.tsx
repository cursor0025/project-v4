'use client'

import { useState } from 'react'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  width?: string
  height?: string
}

export default function ImageWithSkeleton({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animation skeleton pendant chargement */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }}
        />
      )}

      {/* Image réelle */}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />

      {/* Message erreur si image ne charge pas */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <p className="text-xs text-gray-400">❌ Image indisponible</p>
        </div>
      )}
    </div>
  )
}
