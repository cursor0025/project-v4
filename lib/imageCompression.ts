/**
 * Compression intelligente d'images avec Canvas API
 * - Préserve la qualité visuelle
 * - Réduit significativement la taille
 * - 100% gratuit et local
 */

export interface CompressionOptions {
    maxWidthOrHeight?: number
    quality?: number
    mimeType?: 'image/jpeg' | 'image/png' | 'image/webp'
  }
  
  /**
   * Compresse une image File en conservant une bonne qualité
   */
  export async function compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> {
    const {
      maxWidthOrHeight = 1920, // Largeur/hauteur max (Full HD)
      quality = 0.85, // 85% de qualité (excellent compromis)
      mimeType = 'image/jpeg'
    } = options
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
  
      reader.onload = (e) => {
        const img = new Image()
  
        img.onload = () => {
          // Calculer les nouvelles dimensions
          let { width, height } = img
  
          if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
            if (width > height) {
              height = (height / width) * maxWidthOrHeight
              width = maxWidthOrHeight
            } else {
              width = (width / height) * maxWidthOrHeight
              height = maxWidthOrHeight
            }
          }
  
          // Créer canvas pour compression
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
  
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'))
            return
          }
  
          // Dessiner l'image avec anti-aliasing pour meilleure qualité
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
  
          // Convertir en Blob compressé
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Échec de la compression'))
                return
              }
  
              // Créer un nouveau File à partir du Blob
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now()
              })
  
              // Log de la réduction de taille (optionnel)
              const originalSizeKB = (file.size / 1024).toFixed(2)
              const compressedSizeKB = (compressedFile.size / 1024).toFixed(2)
              console.log(`✅ Compression : ${originalSizeKB}KB → ${compressedSizeKB}KB`)
  
              resolve(compressedFile)
            },
            mimeType,
            quality
          )
        }
  
        img.onerror = () => {
          reject(new Error('Erreur de chargement de l\'image'))
        }
  
        img.src = e.target?.result as string
      }
  
      reader.onerror = () => {
        reject(new Error('Erreur de lecture du fichier'))
      }
  
      reader.readAsDataURL(file)
    })
  }
  
  /**
   * Compresse plusieurs images en parallèle
   */
  export async function compressImages(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<File[]> {
    return Promise.all(files.map((file) => compressImage(file, options)))
  }
  
  /**
   * Valide si un fichier est une image
   */
  export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }
  
  /**
   * Formate la taille en Ko ou Mo
   */
  export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }
  