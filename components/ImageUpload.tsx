// components/vendor/ImageUpload.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// On définit ce que le composant attend comme données
interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Client Supabase pour le navigateur
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    
    // 1. On crée un nom unique pour le fichier (ex: 12345-mon-image.jpg)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // 2. On envoie chez Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('products') // Nom du bucket qu'on a créé
      .upload(filePath, file)

    if (uploadError) {
      alert('Erreur upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    // 3. On récupère le lien public
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    // 4. On met à jour la liste
    const newImages = [...images, publicUrl]
    setImages(newImages)
    onImagesChange(newImages) // On prévient le formulaire parent
    setUploading(false)
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
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
            <img src={url} alt="Produit" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Bouton d'ajout (visible si on n'a pas atteint la limite) */}
        {images.length < maxImages && (
          <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center justify-center cursor-pointer">
            {uploading ? (
              <span className="text-sm text-gray-500 animate-pulse">Envoi...</span>
            ) : (
              <>
                <span className="text-3xl text-gray-400 mb-2">+</span>
                <span className="text-xs text-gray-500 font-medium">Ajouter photo</span>
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