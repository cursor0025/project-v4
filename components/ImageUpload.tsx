// components/vendor/ImageUpload.tsx
'use client'

import { useState, useCallback, DragEvent } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, Upload } from 'lucide-react'
import { compressImage, isImageFile, formatFileSize } from '@/lib/imageCompression'

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Client Supabase pour le navigateur
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const uploadSingleFile = useCallback(
    async (file: File) => {
      // 1) Compression locale
      setUploadProgress(`Compression de ${file.name} (${formatFileSize(file.size)})...`)
      const compressed = await compressImage(file, {
        maxWidthOrHeight: 1920,
        quality: 0.85,
      })

      // 2) Préparer nom unique
      const fileExt = compressed.name.split('.').pop()
      const baseName = compressed.name.replace(/\.[^/.]+$/, '')
      const fileName = `${baseName}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`
      const filePath = `${fileName}`

      // 3) Upload vers Supabase
      setUploadProgress(
        `Upload de ${compressed.name} (${formatFileSize(compressed.size)})...`
      )

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressed)

      if (uploadError) {
        console.error(uploadError)
        throw new Error('Erreur upload: ' + uploadError.message)
      }

      // 4) Récupérer l’URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(filePath)

      return publicUrl
    },
    [supabase]
  )

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      if (images.length >= maxImages) return

      const files = Array.from(fileList).filter(isImageFile)

      if (files.length === 0) return

      setUploading(true)
      setUploadProgress('Préparation des images...')

      try {
        const remainingSlots = maxImages - images.length
        const filesToUpload = files.slice(0, remainingSlots)

        const uploadedUrls: string[] = []

        // Upload en série pour pouvoir afficher une progression lisible
        for (const file of filesToUpload) {
          const url = await uploadSingleFile(file)
          uploadedUrls.push(url)
        }

        const newImages = [...images, ...uploadedUrls]
        setImages(newImages)
        onImagesChange(newImages)
      } catch (err: any) {
        alert(err.message || 'Erreur lors de l’upload')
      } finally {
        setUploading(false)
        setUploadProgress(null)
      }
    },
    [images, maxImages, onImagesChange, uploadSingleFile]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files)
    // reset pour pouvoir re-sélectionner le même fichier
    e.target.value = ''
  }

  // Drag & Drop handlers
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const dt = e.dataTransfer
    if (!dt) return

    await handleFiles(dt.files)
  }

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Affichage des images déjà uploadées */}
        {images.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
          >
            <img
              src={url}
              alt="Produit"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Bouton d'ajout + zone drag & drop */}
        {images.length < maxImages && (
          <label
            className={`relative aspect-square rounded-lg border-2 border-dashed transition flex flex-col items-center justify-center cursor-pointer ${
              isDragOver
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin mb-2" />
                <span className="text-xs text-gray-500 font-medium">
                  {uploadProgress ?? 'Envoi...'}
                </span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-600 font-medium text-center">
                  Cliquer ou glisser‑déposer une image
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  JPG, PNG, WEBP • max {maxImages} images
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {images.length} / {maxImages} photos. La première photo sera l'image principale.
      </p>
    </div>
  )
}
