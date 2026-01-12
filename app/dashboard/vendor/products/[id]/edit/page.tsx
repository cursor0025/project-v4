'use client'

import { use, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2, X, Upload,
  Package, DollarSign, Tag, AlertCircle, CheckCircle2, Sparkles, Percent,
  Eye, Clock
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import imageCompression from 'browser-image-compression'

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
  { value: 'salon_coiffure_esthetique_femme', label: '💇 Salon de Coiffure & Esthétique – Femme', icon: '💇' },
  { value: 'produits_naturels_herboristerie', label: '🌿 Produits Naturels & Herboristerie', icon: '🌿' },
  { value: 'meubles_maison', label: '🛋️ Meubles & Maison', icon: '🛋️' },
  { value: 'textiles_maison', label: '🛏️ Textiles Maison', icon: '🛏️' },
  { value: 'decoration_maison', label: '🎨 Décoration Maison', icon: '🎨' },
  { value: 'ustensiles_cuisine', label: '🍳 Ustensiles de Cuisine', icon: '🍳' },
  { value: 'services_alimentaires', label: '🍽️ Services Alimentaires', icon: '🍽️' },
  { value: 'equipement_magasin_pro', label: '🏪 Équipement Magasin & Pro', icon: '🏪' },
  { value: 'cuisinistes_cuisines_completes', label: '🔧 Cuisinistes & Cuisines Complètes', icon: '🔧' },
  { value: 'sport_materiel_sportif', label: '⚽ Sport & Matériel Sportif', icon: '⚽' },
  { value: 'bricolage', label: '🔨 Bricolage', icon: '🔨' },
  { value: 'materiaux_equipements_construction', label: '🏗️ Matériaux & Équipements Construction', icon: '🏗️' },
  { value: 'pieces_detachees', label: '🔩 Pièces Détachées', icon: '🔩' },
  { value: 'equipement_bebe', label: '🍼 Équipement Bébé', icon: '🍼' },
  { value: 'artisanat', label: '🎭 Artisanat', icon: '🎭' },
  { value: 'loisirs_divertissement', label: '🎪 Loisirs & Divertissement', icon: '🎪' },
  { value: 'alimentation_epicerie', label: '🛒 Alimentation & Épicerie', icon: '🛒' },
  { value: 'agences_voyage', label: '✈️ Agences de Voyage', icon: '✈️' },
  { value: 'education', label: '📚 Éducation', icon: '📚' },
  { value: 'bijoux', label: '💎 Bijoux', icon: '💎' },
  { value: 'montres_lunettes', label: '⌚ Montres & Lunettes', icon: '⌚' },
  { value: 'vape_cigarettes_electroniques', label: '💨 Vape & Cigarettes Électroniques', icon: '💨' },
  { value: 'materiel_medical', label: '⚕️ Matériel Médical', icon: '⚕️' },
  { value: 'promoteurs_immobiliers', label: '🏘️ Promoteurs Immobiliers', icon: '🏘️' },
  { value: 'engins_travaux_publics', label: '🚜 Engins de Travaux Publics', icon: '🚜' },
  { value: 'fete_mariage', label: '💒 Fête & Mariage', icon: '💒' },
  { value: 'kaba', label: '🕋 Kaba', icon: '🕋' },
  { value: 'divers', label: '📦 Divers', icon: '📦' }
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
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    stock: '1',
    category: '',
    subcategory: '',
    status: 'active' as 'active' | 'draft' | 'archived'
  })
  const [images, setImages] = useState<ProductImage[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const discountPercent = formData.price && formData.old_price && parseFloat(formData.old_price) > 0
    ? Math.round(((parseFloat(formData.old_price) - parseFloat(formData.price)) / parseFloat(formData.old_price)) * 100)
    : 0

  // ==================== NETTOYAGE DES URLs AU DÉMONTAGE ====================
  useEffect(() => {
    return () => {
      images.forEach(img => {
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
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseBrowserClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Vous devez être connecté')
        router.push('/dashboard/vendor/products')
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('vendor_id', user.id)
        .single()

      if (error) {
        console.error('Erreur chargement produit:', error)
        toast.error('Produit introuvable ou accès refusé')
        router.push('/dashboard/vendor/products')
        return
      }

      if (!data) {
        toast.error('Produit introuvable')
        router.push('/dashboard/vendor/products')
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
        status: data.status || 'active'
      })

      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const existingImages: ProductImage[] = data.images.map((url: string, index: number) => ({
          id: `existing-${index}-${Date.now()}`,
          preview: url,
          isExisting: true,
          compressed: true
        }))
        setImages(existingImages)
      }

    } catch (error) {
      console.error('Erreur complète:', error)
      toast.error('Erreur lors du chargement du produit')
      router.push('/dashboard/vendor/products')
    } finally {
      setLoading(false)
    }
  }

  // ==================== COMPRESSION D'IMAGES ====================
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.29,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85,
      fileType: 'image/jpeg'
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      console.log(`✅ Compression: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`)
      return compressedFile
    } catch (error) {
      console.error('❌ Erreur compression:', error)
      toast.error('Erreur lors de la compression de l\'image')
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
    toast.loading(`📦 Compression de ${fileArray.length} image(s)...`, { id: 'compressing' })

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
          size: compressedFile.size
        })
      }

      setImages(prev => [...prev, ...newImages])
      toast.success(
        `✅ ${newImages.length} image(s) ajoutée(s) avec succès !`, 
        { id: 'compressing', duration: 3000 }
      )
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
    const img = images.find(i => i.id === imageId)
    
    if (img?.isExisting && imageUrl) {
      setImagesToDelete(prev => [...prev, imageUrl])
      toast('🗑️ Image marquée pour suppression', { duration: 2000 })
    } else if (img?.preview && !img.isExisting) {
      try {
        URL.revokeObjectURL(img.preview)
      } catch (error) {
        console.warn('Erreur nettoyage URL:', error)
      }
      toast.success('✅ Image retirée', { duration: 2000 })
    }
    
    setImages(prev => prev.filter(i => i.id !== imageId))
  }

  // ==================== VALIDATION CORRIGÉE ====================
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('❌ Le nom du produit est obligatoire')
      return false
    }

    if (formData.name.trim().length < 3) {
      toast.error('❌ Le nom doit contenir au moins 3 caractères')
      return false
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('❌ Le prix de vente doit être supérieur à 0')
      return false
    }

    // ✅ CORRECTION: Ignorer la validation si l'ancien prix est 0 ou vide
    const oldPriceValue = formData.old_price ? parseFloat(formData.old_price) : 0
    const priceValue = parseFloat(formData.price)

    if (oldPriceValue > 0 && oldPriceValue <= priceValue) {
      toast.error('❌ L\'ancien prix doit être supérieur au prix de vente pour activer la promotion')
      return false
    }

    if (!formData.category) {
      toast.error('❌ Veuillez sélectionner une catégorie')
      return false
    }

    const stockValue = parseInt(formData.stock)
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error('❌ Le stock doit être supérieur ou égal à 0')
      return false
    }

    if (images.length === 0) {
      toast.error('❌ Veuillez ajouter au moins une photo')
      return false
    }

    return true
  }

  // ==================== SAUVEGARDE OPTIMISÉE ET ROBUSTE ====================
  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setUploadProgress(0)
    toast.loading('💾 Mise à jour du produit en cours...', { id: 'save' })

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Vous devez être connecté pour modifier ce produit')
      }

      // ✅ ÉTAPE 1: Suppression robuste des anciennes images
      if (imagesToDelete.length > 0) {
        toast.loading(`🗑️ Suppression de ${imagesToDelete.length} ancienne(s) image(s)...`, { id: 'save' })
        
        let deletedCount = 0
        let failedCount = 0

        for (const imageUrl of imagesToDelete) {
          try {
            const urlParts = imageUrl.split('/products/')
            if (urlParts.length === 2) {
              const imagePath = urlParts[1]
              
              const { error: deleteError } = await supabase.storage
                .from('products')
                .remove([imagePath])
              
              if (deleteError) {
                console.warn(`⚠️ Impossible de supprimer ${imagePath}:`, deleteError.message)
                failedCount++
              } else {
                console.log(`✅ Image supprimée: ${imagePath}`)
                deletedCount++
              }
            }
          } catch (error) {
            console.warn('⚠️ Erreur lors de la suppression d\'une image:', error)
            failedCount++
          }
        }

        console.log(`📊 Suppression: ${deletedCount} réussies, ${failedCount} échouées`)
      }

      // ✅ ÉTAPE 2: Conservation des images existantes
      const existingImageUrls = images
        .filter(img => img.isExisting)
        .map(img => img.preview)

      // ✅ ÉTAPE 3: Upload robuste des nouvelles images
      const newImages = images.filter(img => !img.isExisting && img.file)
      const uploadedUrls: string[] = []
      
      if (newImages.length > 0) {
        toast.loading(`📤 Upload de ${newImages.length} nouvelle(s) image(s)...`, { id: 'save' })
        const totalImages = newImages.length

        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i]
          if (!img.file) continue

          try {
            const fileExtension = img.file.type.split('/')[1] || 'jpg'
            const fileName = `${user.id}/${Date.now()}-${img.id}.${fileExtension}`
            
            setUploadProgress(Math.round(((i + 0.5) / totalImages) * 100))

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('products')
              .upload(fileName, img.file, {
                contentType: img.file.type,
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) {
              console.error(`❌ Erreur upload image ${i + 1}:`, uploadError)
              throw new Error(`Erreur lors de l'upload de l'image ${i + 1}: ${uploadError.message}`)
            }

            const { data: { publicUrl } } = supabase.storage
              .from('products')
              .getPublicUrl(fileName)

            uploadedUrls.push(publicUrl)
            console.log(`✅ Image ${i + 1}/${totalImages} uploadée: ${fileName}`)
            setUploadProgress(Math.round(((i + 1) / totalImages) * 100))

          } catch (error: any) {
            console.error(`❌ Échec upload image ${i + 1}:`, error)
            throw new Error(`Échec de l'upload de l'image ${i + 1}`)
          }
        }
      }

      // ✅ ÉTAPE 4: Combinaison finale des URLs
      const finalImageUrls = [...existingImageUrls, ...uploadedUrls]

      if (finalImageUrls.length === 0) {
        throw new Error('⚠️ Aucune image disponible pour le produit')
      }

      toast.loading('💾 Enregistrement des modifications...', { id: 'save' })

      // ✅ ÉTAPE 5: Préparation des données avec gestion des valeurs nulles
      const oldPriceValue = formData.old_price && parseFloat(formData.old_price) > 0 
        ? parseFloat(formData.old_price) 
        : null

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        old_price: oldPriceValue,
        category: formData.category,
        subcategory: formData.subcategory.trim() || null,
        stock: parseInt(formData.stock) || 0,
        status: formData.status,
        images: finalImageUrls,
        updated_at: new Date().toISOString()
      }

      console.log('📝 Données à mettre à jour:', updateData)

      // ✅ ÉTAPE 6: Update dans Supabase
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
        throw new Error('⚠️ Le produit n\'a pas pu être mis à jour')
      }

      console.log('✅ Produit mis à jour avec succès:', updatedProduct)

      toast.success('🎉 Produit mis à jour avec succès !', { 
        id: 'save',
        duration: 3000
      })

      // ✅ ÉTAPE 7: Nettoyage des URLs avant redirection
      setTimeout(() => {
        images.forEach(img => {
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
        duration: 6000
      })
      
      setSaving(false)
      setUploadProgress(0)
    }
  }

  // ==================== AFFICHAGE ====================
  if (loading) {
    return <PageSkeleton />
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Produit introuvable</h2>
          <p className="text-gray-400 mb-6">Ce produit n'existe pas ou vous n'avez pas accès.</p>
          <Link href="/dashboard/vendor/products">
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all">
              Retour à la liste
            </button>
          </Link>
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
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            },
            duration: 3000
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            },
            duration: 6000
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff'
            }
          }
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
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 
                          flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
                Modifier le produit
              </h1>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Dernière modification : {new Date(product.updated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#161618] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
        >
          <div className="space-y-7">
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
                <span className={formData.name.length > 100 ? 'text-orange-400 font-semibold' : ''}>
                  {formData.name.length}/120
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  Catégorie <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={saving}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                           hover:border-white/20 focus:outline-none focus:border-orange-500 focus:ring-2 
                           focus:ring-orange-500/20 transition-all appearance-none cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1.25rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="" className="bg-[#161618]">Choisissez une catégorie...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-[#161618] py-2">
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  disabled={saving}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                           hover:border-white/20 focus:outline-none focus:border-orange-500 focus:ring-2 
                           focus:ring-orange-500/20 transition-all appearance-none cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1.25rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="active" className="bg-[#161618]">✅ Actif (visible sur BZMarket)</option>
                  <option value="draft" className="bg-[#161618]">📝 Brouillon (non publié)</option>
                  <option value="archived" className="bg-[#161618]">📦 Archivé (masqué)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-5">
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Prix de vente (DA) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                    DA
                  </span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="100"
                    disabled={saving}
                    className="w-full pl-16 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl 
                             text-white text-xl font-bold placeholder:text-gray-500 hover:border-white/20 
                             focus:outline-none focus:border-orange-500 focus:ring-2 
                             focus:ring-orange-500/20 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Ancien prix (DA)
                  <span className="text-xs text-gray-500 font-normal">(0 = pas de promo)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                    DA
                  </span>
                  <input
                    type="number"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="100"
                    disabled={saving}
                    className="w-full pl-16 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl 
                             text-white text-xl font-bold placeholder:text-gray-500 hover:border-white/20 
                             focus:outline-none focus:border-orange-500 focus:ring-2 
                             focus:ring-orange-500/20 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="md:col-span-2 flex items-end">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-full h-[56px] bg-gradient-to-br from-green-500/30 to-emerald-500/30 
                             border-2 border-green-500/50 rounded-2xl flex items-center justify-center 
                             gap-2 shadow-lg shadow-green-500/20"
                  >
                    <Percent className="w-6 h-6 text-green-400" />
                    <span className="text-2xl font-black text-green-400">
                      -{discountPercent}%
                    </span>
                  </motion.div>
                </div>
              )}
            </div>

            <div className="md:w-1/2">
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                Quantité en stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                min="0"
                step="1"
                disabled={saving}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                         text-lg font-semibold hover:border-white/20 focus:outline-none focus:border-orange-500 
                         focus:ring-2 focus:ring-orange-500/20 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                {parseInt(formData.stock) === 0 ? '⚠️ Rupture de stock' : 
                 parseInt(formData.stock) < 5 ? '⚠️ Stock faible' : 
                 '✅ Stock disponible'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400" />
                Description du produit
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez en détail votre produit : état, caractéristiques, avantages, défauts éventuels..."
                rows={6}
                maxLength={2000}
                disabled={saving}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white 
                         placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                         focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                <span>Une description détaillée augmente les chances de vente</span>
                <span className={formData.description.length > 1800 ? 'text-orange-400 font-semibold' : ''}>
                  {formData.description.length}/2000
                </span>
              </p>
            </div>

            <div className="border-t border-white/10 pt-7">
              <label className="block text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-pink-400" />
                Photos du produit <span className="text-red-400">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">
                  ({images.length}/5 photos • La 1ère sera l'image principale)
                </span>
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => images.length < 5 && !isCompressing && !saving && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer 
                         transition-all duration-300 ${
                  isDragging 
                    ? 'border-orange-500 bg-orange-500/10 scale-[1.02] shadow-lg shadow-orange-500/20' 
                    : images.length >= 5
                      ? 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                      : 'border-white/20 hover:border-orange-500/50 bg-white/5 hover:bg-orange-500/5'
                } ${saving ? 'pointer-events-none opacity-50' : ''}`}
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                    <div>
                      <p className="text-white font-bold text-lg mb-1">Compression intelligente en cours...</p>
                      <p className="text-gray-400 text-sm">Optimisation pour des performances maximales</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-20 h-20 mx-auto text-gray-400 mb-4" />
                    <p className="text-white font-bold text-xl mb-2">
                      {images.length >= 5 
                        ? '✅ Maximum de 5 photos atteint' 
                        : '📸 Glissez vos images ici ou cliquez'}
                    </p>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      Formats: JPG, PNG, WebP • Taille max: 10 Mo par image
                      <br />
                      <span className="text-orange-400 font-semibold">
                        ✨ Compression automatique pour un chargement ultra-rapide
                      </span>
                    </p>
                  </>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={images.length >= 5 || isCompressing || saving}
                />
              </div>

              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                      <motion.div
                        key={img.id}
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group aspect-square rounded-2xl overflow-hidden border-2 
                                 border-white/10 bg-white/5 hover:border-orange-500/50 transition-all"
                      >
                        <img
                          src={img.preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 
                                      to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {index === 0 && (
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 
                                       rounded-lg text-xs font-black text-white shadow-lg"
                            >
                              🌟 PRINCIPALE
                            </motion.div>
                          )}
                          {img.isExisting && (
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="px-2.5 py-1 bg-blue-500 rounded-lg text-xs font-bold 
                                       text-white shadow-lg"
                            >
                              📌 Actuelle
                            </motion.div>
                          )}
                          {!img.isExisting && img.size && (
                            <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.15 }}
                              className="px-2.5 py-1 bg-green-500 rounded-lg text-xs font-bold 
                                       text-white shadow-lg"
                            >
                              ✨ {(img.size / 1024).toFixed(0)}Ko
                            </motion.div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(img.id, img.preview)
                          }}
                          disabled={saving}
                          className="absolute top-2 right-2 w-9 h-9 bg-red-500 hover:bg-red-600 
                                   rounded-xl flex items-center justify-center opacity-0 
                                   group-hover:opacity-100 transition-all shadow-lg
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>

                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-black/70 backdrop-blur-sm 
                                      rounded-lg flex items-center justify-center opacity-0 
                                      group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-black text-white">#{index + 1}</span>
                        </div>
                      </motion.div>
                    ))}

                    {Array.from({ length: 5 - images.length }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="aspect-square rounded-2xl border-2 border-dashed border-white/10 
                                 bg-white/5 flex items-center justify-center"
                      >
                        <ImageIcon className="w-10 h-10 text-gray-600" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {images.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl 
                           flex items-start gap-3"
                >
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-bold mb-1 text-sm">
                      ⚠️ Aucune photo ajoutée
                    </p>
                    <p className="text-red-200/80 text-xs">
                      Vous devez ajouter au moins une photo pour publier votre produit.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/vendor/products">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold 
                           rounded-xl border border-white/10 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </motion.button>
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: saving ? 1 : 1.05 }}
              whileTap={{ scale: saving ? 1 : 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 
                       hover:from-orange-600 hover:to-red-700 text-white font-black text-lg
                       rounded-xl flex items-center gap-3 shadow-lg shadow-orange-500/40 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                       disabled:shadow-none"
            >
              {saving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Upload ${uploadProgress}%` 
                      : 'Enregistrement...'}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </motion.button>
          </div>

          {saving && uploadProgress > 0 && uploadProgress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-orange-200 font-bold flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-bounce" />
                  Upload des nouvelles images en cours...
                </span>
                <span className="text-lg font-black text-orange-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
