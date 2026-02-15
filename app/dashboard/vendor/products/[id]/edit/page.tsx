'use client'

import { use, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  Trash2,
  X,
  Upload,
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Percent,
  Eye,
  Clock,
  Truck,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import SimpleVariantGrid, { SimpleVariant } from '@/components/product/SimpleVariantGrid'

// ==================== TYPES ====================

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  old_price: number | null
  category: string
  subcategory: string | null
  stock: number
  images: string[]
  metadata: Record<string, any>
  status: 'active' | 'draft' | 'archived'
  delivery_available: boolean
  created_at: string
  updated_at: string
  vendor_id: string
}

interface ProductImage {
  id: string
  file?: File
  preview: string
  isExisting: boolean
  compressed: boolean
  size?: number
}

// ==================== CATÉGORIES AVEC VARIANTES ====================

const VARIANT_CATEGORIES = ['vetement', 'sportswear', 'fete', 'mariage', 'chaussure']

// ==================== TAILLES PAR TYPE ====================

const SIZE_PRESETS = {
  standard: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  pants: ['36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56'],
  shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  kids: ['2A', '4A', '6A', '8A', '10A', '12A', '14A'],
} as const

// ==================== 44 CATÉGORIES BZMarket ====================

const CATEGORIES = [
  { value: 'telephones_accessoires', label: '📱 Téléphones & Accessoires', icon: '📱' },
  { value: 'accessoires_auto_moto', label: '🏍️ Accessoires Auto & Moto', icon: '🏍️' },
  { value: 'vehicules', label: '🚗 Véhicules', icon: '🚗' },
  { value: 'immobilier', label: '🏢 Immobilier', icon: '🏢' },
  { value: 'informatique_it', label: '💻 Informatique & IT', icon: '💻' },
  { value: 'electronique', label: '📷 Électronique', icon: '📷' },
  { value: 'electromenager', label: '🏠 Électroménager', icon: '🏠' },
  { value: 'gaming', label: '🎮 Gaming', icon: '🎮' },
  { value: 'vetements_femme', label: '👗 Vêtements Femme', icon: '👗' },
  { value: 'vetements_homme', label: '👔 Vêtements Homme', icon: '👔' },
  { value: 'vetements_homme_classique', label: '🤵 Vêtements Homme Classique', icon: '🤵' },
  { value: 'sportswear', label: '🏃 Sportswear', icon: '🏃' },
  { value: 'vetements_bebe', label: '👶 Vêtements Bébé', icon: '👶' },
  { value: 'sante_beaute', label: '💄 Santé & Beauté', icon: '💄' },
  { value: 'cosmetiques', label: '💅 Cosmétiques', icon: '💅' },
  { value: 'salon_coiffure_homme', label: '💈 Salon de Coiffure – Homme', icon: '💈' },
  {
    value: 'salon_coiffure_esthetique_femme',
    label: '💇 Salon de Coiffure & Esthétique – Femme',
    icon: '💇',
  },
  {
    value: 'produits_naturels_herboristerie',
    label: '🌿 Produits Naturels & Herboristerie',
    icon: '🌿',
  },
  { value: 'meubles_maison', label: '🛋️ Meubles & Maison', icon: '🛋️' },
  { value: 'textiles_maison', label: '🛏️ Textiles Maison', icon: '🛏️' },
  { value: 'decoration_maison', label: '🎨 Décoration Maison', icon: '🎨' },
  { value: 'ustensiles_cuisine', label: '🍳 Ustensiles de Cuisine', icon: '🍳' },
  { value: 'services_alimentaires', label: '🍽️ Services Alimentaires', icon: '🍽️' },
  { value: 'equipement_magasin_pro', label: '🏪 Équipement Magasin & Pro', icon: '🏪' },
  {
    value: 'cuisinistes_cuisines_completes',
    label: '🔧 Cuisinistes & Cuisines Complètes',
    icon: '🔧',
  },
  { value: 'sport_materiel_sportif', label: '⚽ Sport & Matériel Sportif', icon: '⚽' },
  { value: 'bricolage', label: '🔨 Bricolage', icon: '🔨' },
  {
    value: 'materiaux_equipements_construction',
    label: '🏗️ Matériaux & Équipements Construction',
    icon: '🏗️',
  },
  { value: 'pieces_detachees', label: '🔩 Pièces Détachées', icon: '🔩' },
  { value: 'equipement_bebe', label: '🍼 Équipement Bébé', icon: '🍼' },
  { value: 'artisanat', label: '🎭 Artisanat', icon: '🎭' },
  { value: 'loisirs_divertissement', label: '🎪 Loisirs & Divertissement', icon: '🎪' },
  { value: 'alimentation_epicerie', label: '🛒 Alimentation & Épicerie', icon: '🛒' },
  { value: 'agences_voyage', label: '✈️ Agences de Voyage', icon: '✈️' },
  { value: 'education', label: '📚 Éducation', icon: '📚' },
  { value: 'bijoux', label: '💎 Bijoux', icon: '💎' },
  { value: 'montres_lunettes', label: '⌚ Montres & Lunettes', icon: '⌚' },
  {
    value: 'vape_cigarettes_electroniques',
    label: '💨 Vape & Cigarettes Électroniques',
    icon: '💨',
  },
  { value: 'materiel_medical', label: '⚕️ Matériel Médical', icon: '⚕️' },
  { value: 'promoteurs_immobiliers', label: '🏘️ Promoteurs Immobiliers', icon: '🏘️' },
  { value: 'engins_travaux_publics', label: '🚜 Engins de Travaux Publics', icon: '🚜' },
  { value: 'fete_mariage', label: '💒 Fête & Mariage', icon: '💒' },
  { value: 'kaba', label: '🕋 Kaba', icon: '🕋' },
  { value: 'divers', label: '📦 Divers', icon: '📦' },
]

// ==================== COMPOSANT SKELETON ====================

const PageSkeleton = () => (
  <div className="min-h-screen bg-[#0c0c0c] p-4 md:p-6 lg:p-8">
    <div className="max-w-4xl mx-auto">
      <div className="h-10 w-32 bg-white/5 rounded-lg mb-8 animate-pulse" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
        <div className="flex-1">
          <div className="h-8 w-64 bg-white/5 rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-[#161618] border border-white/10 rounded-3xl p-6 h-40 animate-pulse"
          />
        ))}
      </div>

      <div className="bg-[#161618] border border-white/10 rounded-3xl p-8">
        <div className="space-y-6">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-white/5 rounded mb-3 animate-pulse" />
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ==================== COMPOSANT PRINCIPAL ====================

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    stock: '1',
    category: '',
    subcategory: '',
    status: 'active' as 'active' | 'draft' | 'archived',
    delivery_available: true,
  })
  const [images, setImages] = useState<ProductImage[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  // États pour les variantes
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<SimpleVariant[]>([])
  const [colorImages, setColorImages] = useState<Record<string, File>>({})
  const [existingImageMapping, setExistingImageMapping] = useState<
    Record<string, string>
  >({})
  const [basePrice, setBasePrice] = useState(2500)
  const [baseSKU] = useState('PROD')
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  const discountPercent =
    formData.price &&
    formData.old_price &&
    parseFloat(formData.old_price) > 0 &&
    parseFloat(formData.price) > 0
      ? Math.round(
          ((parseFloat(formData.old_price) - parseFloat(formData.price)) /
            parseFloat(formData.old_price)) *
            100,
        )
      : 0

  // ==================== NETTOYAGE DES URLs AU DÉMONTAGE ====================

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.isExisting && img.preview) {
          try {
            URL.revokeObjectURL(img.preview)
          } catch (error) {
            console.warn('Erreur lors du nettoyage URL:', error)
          }
        }
      })
    }
  }, [images])

  // ==================== CHARGEMENT DU PRODUIT ====================

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createSupabaseBrowserClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Vous devez être connecté')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('vendor_id', user.id)
        .single()

      if (fetchError) {
        console.error('Erreur chargement produit:', fetchError)
        setError('Produit introuvable ou accès refusé')
        setLoading(false)
        return
      }

      if (!data) {
        setError('Produit introuvable')
        setLoading(false)
        return
      }

      setProduct(data)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price ? data.price.toString() : '',
        old_price: data.old_price ? data.old_price.toString() : '',
        stock: data.stock ? data.stock.toString() : '1',
        category: data.category || '',
        subcategory: data.subcategory || '',
        status: data.status || 'active',
        delivery_available: data.delivery_available ?? true,
      })

      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const existingImages: ProductImage[] = data.images.map(
          (url: string, index: number) => ({
            id: `existing-${index}-${Date.now()}`,
            preview: url,
            isExisting: true,
            compressed: true,
          }),
        )
        setImages(existingImages)
      }

      // Détection variantes
      const hasMetadataVariants =
        data.metadata?.variants &&
        Array.isArray(data.metadata.variants) &&
        data.metadata.variants.length > 0

      const normalizedCategory = data.category
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\s-]/g, '')

      const isVariantCategory = VARIANT_CATEGORIES.some((cat) =>
        normalizedCategory
          ?.includes(
            cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          ),
      )

      if (hasMetadataVariants && isVariantCategory) {
        setHasVariants(true)
        setVariants(data.metadata.variants)

        const prices = data.metadata.variants.map((v: SimpleVariant) => v.price)
        if (prices.length > 0) {
          setBasePrice(Math.min(...prices))
        }

        detectAvailableSizes(data.category, data.subcategory)

        if (data.metadata.specifications?.imageMapping) {
          setExistingImageMapping(data.metadata.specifications.imageMapping)
        }
      } else {
        setHasVariants(false)
      }
    } catch (error) {
      console.error('Erreur complète:', error)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const detectAvailableSizes = (category: string, subcategory: string | null) => {
    const catName = category?.toLowerCase() || ''
    const subName = (subcategory || '').toLowerCase()

    if (
      subName.includes('chaussure') ||
      subName.includes('basket') ||
      subName.includes('botte')
    ) {
      setAvailableSizes(SIZE_PRESETS.shoes as unknown as string[])
    } else if (
      subName.includes('pantalon') ||
      subName.includes('jean') ||
      subName.includes('jogging') ||
      subName.includes('short')
    ) {
      setAvailableSizes(SIZE_PRESETS.pants as unknown as string[])
    } else if (
      catName.includes('bébé') ||
      catName.includes('bebe') ||
      catName.includes('enfant') ||
      subName.includes('bébé') ||
      subName.includes('bebe') ||
      subName.includes('enfant')
    ) {
      setAvailableSizes(SIZE_PRESETS.kids as unknown as string[])
    } else {
      setAvailableSizes(SIZE_PRESETS.standard as unknown as string[])
    }
  }

  // ==================== COMPRESSION D'IMAGES ====================

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.29,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85,
      fileType: 'image/jpeg',
    }

    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('❌ Erreur compression:', error)
      toast.error("Erreur lors de la compression de l'image")
      return file
    }
  }

  // ==================== GESTION DES IMAGES ====================

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = 5 - images.length
    if (remainingSlots === 0) {
      toast.error('⚠️ Maximum 5 photos atteint')
      return
    }

    const fileArray = Array.from(files).slice(0, remainingSlots)
    setIsCompressing(true)
    toast.loading(`📦 Compression de ${fileArray.length} image(s)...`, {
      id: 'compressing',
    })

    try {
      const newImages: ProductImage[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]

        if (!file.type.startsWith('image/')) {
          toast.error(`❌ ${file.name} n'est pas une image valide`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`❌ ${file.name} est trop volumineux (max 10 Mo)`)
          continue
        }

        const compressedFile = await compressImage(file)
        const preview = URL.createObjectURL(compressedFile)

        newImages.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: compressedFile,
          preview,
          isExisting: false,
          compressed: true,
          size: compressedFile.size,
        })
      }

      setImages((prev) => [...prev, ...newImages])
      toast.success(`✅ ${newImages.length} image(s) ajoutée(s) avec succès !`, {
        id: 'compressing',
        duration: 3000,
      })
    } catch (error) {
      console.error('❌ Erreur traitement images:', error)
      toast.error('Erreur lors du traitement des images', { id: 'compressing' })
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const removeImage = (imageId: string, imageUrl?: string) => {
    const img = images.find((i) => i.id === imageId)

    if (img?.isExisting && imageUrl) {
      setImagesToDelete((prev) => [...prev, imageUrl])
      toast('🗑️ Image marquée pour suppression', { duration: 2000 })
    } else if (img?.preview && !img.isExisting) {
      try {
        URL.revokeObjectURL(img.preview)
      } catch (error) {
        console.warn('Erreur nettoyage URL:', error)
      }
      toast.success('✅ Image retirée', { duration: 2000 })
    }

    setImages((prev) => prev.filter((i) => i.id !== imageId))
  }

  // ==================== VALIDATION ====================

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('❌ Le nom du produit est obligatoire')
      return false
    }

    if (formData.name.trim().length < 3) {
      toast.error('❌ Le nom doit contenir au moins 3 caractères')
      return false
    }

    if (!formData.category) {
      toast.error('❌ Veuillez sélectionner une catégorie')
      return false
    }

    if (hasVariants) {
      if (variants.length === 0) {
        toast.error('❌ Veuillez ajouter du stock dans la grille de variantes')
        return false
      }
    } else {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('❌ Le prix de vente doit être supérieur à 0')
        return false
      }

      const stockValue = parseInt(formData.stock)
      if (isNaN(stockValue) || stockValue < 0) {
        toast.error('❌ Le stock doit être supérieur ou égal à 0')
        return false
      }
    }

    const oldPriceValue = formData.old_price ? parseFloat(formData.old_price) : 0
    const priceValue = hasVariants ? basePrice : parseFloat(formData.price)

    if (oldPriceValue > 0 && oldPriceValue <= priceValue) {
      toast.error(
        "❌ L'ancien prix doit être supérieur au prix de vente pour activer la promotion",
      )
      return false
    }

    if (images.length === 0) {
      toast.error('❌ Veuillez ajouter au moins une photo')
      return false
    }

    return true
  }

  // ==================== SAUVEGARDE ====================

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setUploadProgress(0)
    toast.loading('💾 Mise à jour du produit en cours...', { id: 'save' })

    try {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Vous devez être connecté pour modifier ce produit')
      }

      // Suppression anciennes images
      if (imagesToDelete.length > 0) {
        toast.loading(
          `🗑️ Suppression de ${imagesToDelete.length} ancienne(s) image(s)...`,
          { id: 'save' },
        )

        for (const imageUrl of imagesToDelete) {
          try {
            const urlParts = imageUrl.split('/products/')
            if (urlParts.length === 2) {
              const imagePath = urlParts[1]

              const { error: deleteError } = await supabase.storage
                .from('products')
                .remove([imagePath])

              if (deleteError) {
                console.warn(
                  `⚠️ Impossible de supprimer ${imagePath}:`,
                  deleteError.message,
                )
              }
            }
          } catch (error) {
            console.warn("⚠️ Erreur lors de la suppression d'une image:", error)
          }
        }
      }

      // Upload images globales
      const existingImageUrls = images
        .filter((img) => img.isExisting)
        .map((img) => img.preview)

      const newImages = images.filter((img) => !img.isExisting && img.file)
      const uploadedUrls: string[] = []

      if (newImages.length > 0) {
        toast.loading(`📤 Upload de ${newImages.length} nouvelle(s) image(s)...`, {
          id: 'save',
        })
        const totalImages = newImages.length

        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i]
          if (!img.file) continue

          try {
            const fileExtension = img.file.type.split('/')[1] || 'jpg'
            const fileName = `${user.id}/${Date.now()}-${img.id}.${fileExtension}`

            setUploadProgress(Math.round(((i + 0.5) / totalImages) * 100))

            const { error: uploadError } = await supabase.storage
              .from('products')
              .upload(fileName, img.file, {
                contentType: img.file.type,
                cacheControl: '3600',
                upsert: false,
              })

            if (uploadError) {
              console.error(`❌ Erreur upload image ${i + 1}:`, uploadError)
              throw new Error(
                `Erreur lors de l'upload de l'image ${i + 1}: ${uploadError.message}`,
              )
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from('products').getPublicUrl(fileName)

            uploadedUrls.push(publicUrl)
            setUploadProgress(Math.round(((i + 1) / totalImages) * 100))
          } catch (error: any) {
            console.error(`❌ Échec upload image ${i + 1}:`, error)
            throw new Error(`Échec de l'upload de l'image ${i + 1}`)
          }
        }
      }

      const finalImageUrls = [...existingImageUrls, ...uploadedUrls]

      if (finalImageUrls.length === 0) {
        throw new Error('⚠️ Aucune image disponible pour le produit')
      }

      // UPLOAD DES IMAGES DE COULEUR + imageMapping
      const imageMapping: Record<string, string> = { ...existingImageMapping }

      if (hasVariants && Object.keys(colorImages).length > 0) {
        toast.loading(
          `📸 Upload de ${Object.keys(colorImages).length} image(s) de couleur...`,
          { id: 'color-upload' },
        )

        for (const [colorName, file] of Object.entries(colorImages)) {
          try {
            const compressedFile = await compressImage(file)
            const fileExtension = compressedFile.type.split('/')[1] || 'jpg'
            const fileName = `${user.id}/colors/${Date.now()}-${colorName
              .toLowerCase()
              .replace(/\s+/g, '-')}.${fileExtension}`

            const { error: uploadError } = await supabase.storage
              .from('products')
              .upload(fileName, compressedFile, {
                contentType: compressedFile.type,
                cacheControl: '3600',
                upsert: false,
              })

            if (uploadError) {
              console.error(`❌ Erreur upload ${colorName}:`, uploadError)
              continue
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from('products').getPublicUrl(fileName)
            imageMapping[colorName] = publicUrl
          } catch (error) {
            console.error(`❌ Échec upload ${colorName}:`, error)
          }
        }

        if (Object.keys(colorImages).length > 0) {
          toast.success(
            `✅ ${Object.keys(colorImages).length} image(s) de couleur uploadées !`,
            { id: 'color-upload' },
          )
        }
      }

      toast.loading('💾 Enregistrement des modifications...', { id: 'save' })

      const oldPriceValue =
        formData.old_price && parseFloat(formData.old_price) > 0
          ? parseFloat(formData.old_price)
          : null

      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        subcategory: formData.subcategory.trim() || null,
        old_price: oldPriceValue,
        status: formData.status,
        delivery_available: formData.delivery_available,
        images: finalImageUrls,
        updated_at: new Date().toISOString(),
      }

      if (hasVariants && variants.length > 0) {
        const prices = variants.map((v) => v.price)
        updateData.price = Math.min(...prices)
        updateData.stock = variants.reduce((sum, v) => sum + v.stock, 0)

        const colors = Array.from(new Set(variants.map((v) => v.color)))
        const sizes = Array.from(new Set(variants.map((v) => v.size)))

        updateData.metadata = {
          variants: variants.map((v) => ({
            color: v.color,
            size: v.size,
            stock: v.stock,
            price: v.price,
            sku: v.sku,
          })),
          specifications: {
            template: [
              { name: 'Couleur', values: colors },
              { name: 'Taille', values: sizes },
            ],
            imageMapping:
              Object.keys(imageMapping).length > 0 ? imageMapping : undefined,
          },
        }
      } else {
        updateData.price = parseFloat(formData.price)
        updateData.stock = parseInt(formData.stock) || 0
        updateData.metadata = product?.metadata || {}
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .eq('vendor_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erreur mise à jour:', updateError)
        throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`)
      }

      if (!updatedProduct) {
        throw new Error("⚠️ Le produit n'a pas pu être mis à jour")
      }

      toast.success('🎉 Produit mis à jour avec succès !', {
        id: 'save',
        duration: 3000,
      })

      setTimeout(() => {
        images.forEach((img) => {
          if (!img.isExisting && img.preview) {
            try {
              URL.revokeObjectURL(img.preview)
            } catch (error) {
              console.warn('Erreur nettoyage URL:', error)
            }
          }
        })
        router.push('/dashboard/vendor/products')
      }, 1500)
    } catch (error: any) {
      console.error('❌ Erreur complète lors de la sauvegarde:', error)
      const errorMessage = error.message || 'Une erreur inconnue est survenue'

      toast.error(`❌ ${errorMessage}`, {
        id: 'save',
        duration: 6000,
      })

      setSaving(false)
      setUploadProgress(0)
    }
  }

  // ==================== AFFICHAGE ====================

  if (loading) {
    return <PageSkeleton />
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161618] border border-red-500/30 rounded-3xl p-8 text-center"
          >
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              {error || 'Produit introuvable'}
            </h2>
            <p className="text-gray-400 mb-6">
              {error === 'Vous devez être connecté'
                ? 'Veuillez vous connecter pour continuer'
                : "Ce produit n'existe pas ou vous n'avez pas accès"}
            </p>
            <Link href="/dashboard/vendor/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 
                         hover:from-orange-600 hover:to-red-700 text-white font-bold 
                         rounded-xl transition-all shadow-lg"
              >
                Retour à la liste
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4 md:p-6 lg:p-8">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161618',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            duration: 3000,
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 6000,
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard/vendor/products">
            <motion.button
              whileHover={{ scale: 1.02, x: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg.white/10 
                       text-white font-semibold rounded-xl border border-white/10 transition-all
                       shadow-lg shadow-black/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à la liste
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 
                          flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <Package className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text.white mb-1">
                Modifier le produit
              </h1>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Dernière modification :{' '}
                {new Date(product.updated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {hasVariants && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-white font-bold">Mode Variantes Actif</p>
                  <p className="text-sm text-gray-300">
                    Prix et stock calculés automatiquement depuis la grille
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#161618] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
        >
          <div className="space-y-7">
            {/* Nom */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-400" />
                Nom du produit <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: iPhone 15 Pro Max 256Go Titanium Bleu"
                maxLength={120}
                disabled={saving}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                         text-lg placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                         focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                <span>Soyez précis pour attirer plus d'acheteurs</span>
                <span
                  className={
                    formData.name.length > 100 ? 'text-orange-400 font-semibold' : ''
                  }
                >
                  {formData.name.length}/120
                </span>
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Décrivez votre produit en détail..."
                rows={4}
                disabled={saving}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                         placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                         focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all
                         resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Catégorie + Statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  Catégorie <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={saving}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text.white 
                           hover:border-white/20 focus:outline-none focus:border-orange-500 focus:ring-2 
                           focus:ring-orange-500/20 transition-all appearance-none cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-[#161618]">
                    Choisissez une catégorie...
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option
                      key={cat.value}
                      value={cat.value}
                      className="bg-[#161618] py-2"
                    >
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Statut <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'draft' | 'archived',
                    })
                  }
                  disabled={saving}
                  className="w-full px-5 py-4 bg.white/5 border border-white/10 rounded-2xl text-white 
                           hover:border-white/20 focus:outline-none focus:border-orange-500 focus:ring-2 
                           focus:ring-orange-500/20 transition-all appearance-none cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="active" className="bg-[#161618]">
                    ✅ Actif (visible sur BZMarket)
                  </option>
                  <option value="draft" className="bg-[#161618]">
                    📝 Brouillon (non publié)
                  </option>
                  <option value="archived" className="bg-[#161618]">
                    📦 Archivé (masqué)
                  </option>
                </select>
              </div>
            </div>

            {/* Livraison */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Livraison disponible</p>
                    <p className="text-sm text-gray-400">
                      {formData.delivery_available
                        ? '✅ Les clients peuvent commander avec livraison'
                        : '❌ Livraison désactivée (retrait uniquement)'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      delivery_available: !formData.delivery_available,
                    })
                  }
                  disabled={saving}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#161618] disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.delivery_available ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.delivery_available ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Mode variantes ou simple */}
            {hasVariants ? (
              <div className="border-t border-white/10 pt-7">
                <SimpleVariantGrid
                  basePrice={basePrice}
                  setBasePrice={setBasePrice}
                  baseSKU={baseSKU}
                  availableSizes={availableSizes}
                  onChange={setVariants}
                  initialVariants={variants}
                  onImagesChange={(images) => setColorImages(images)}
                  existingImageMapping={existingImageMapping}
                />

                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-yellow-400" />
                    Ancien prix global (DZD)
                    <span className="text-xs text-gray-500 font-normal">
                      (optionnel, pour afficher une promotion)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={formData.old_price}
                      onChange={(e) =>
                        setFormData({ ...formData, old_price: e.target.value })
                      }
                      disabled={saving}
                      className="w-40 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white 
                               placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                               focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-gray-400 font-semibold">DZD</span>
                    {discountPercent > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 text-xs font-semibold">
                        <Sparkles className="w-3 h-3" />
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Si vous indiquez un ancien prix, la réduction sera calculée
                    automatiquement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Prix de vente (DZD) <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        disabled={saving}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text.white 
                                 placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                                 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-gray-400 font-semibold">DZD</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-yellow-400" />
                      Ancien prix (DZD)
                      <span className="text-xs text-gray-500 font-normal">
                        (optionnel, pour afficher une promotion)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.old_price}
                        onChange={(e) =>
                          setFormData({ ...formData, old_price: e.target.value })
                        }
                        disabled={saving}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text.white 
                                 placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                                 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-gray-400 font-semibold">DZD</span>
                    </div>
                    {discountPercent > 0 && (
                      <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Promotion active : -{discountPercent}% affiché sur la fiche
                        produit
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    Stock disponible
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    disabled={saving}
                    className="w-40 px-4 py-2.5 bg.white/5 border border-white/10 rounded-2xl text-white 
                             placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Images produit */}
            <div className="border-t border-white/10 pt-7">
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                Photos du produit <span className="text-red-400">*</span>
              </label>

              <div
                className={`mt-2 border-2 border-dashed rounded-2xl p-5 transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm mb-1">
                      Glissez-déposez vos images ici ou
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving || isCompressing}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      Choisir des images
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG ou PNG, max 10 Mo par image. Jusqu'à 5 photos.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-start">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10"
                      >
                        <img
                          src={img.preview}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id, img.isExisting ? img.preview : undefined)}
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </div>
            </div>

            {/* Bouton sauvegarde */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 mt-6">
              <div className="flex items.center gap-3">
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mise à jour en cours...</span>
                    {uploadProgress > 0 && (
                      <span className="text-gray-400">
                        ({uploadProgress}% upload images)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link href="/dashboard/vendor/products" className="w-full md:w-auto">
                  <button
                    type="button"
                    disabled={saving}
                    className="w-full md:w-auto px-5 py-3 border border-white/20 rounded-xl text-sm font-semibold text-gray-200 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Annuler
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
