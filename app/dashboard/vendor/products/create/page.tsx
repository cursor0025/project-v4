'use client'

import './styles.css'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import { 
  Upload, X, ChevronRight, ChevronLeft, Save, AlertCircle, 
  Percent, Image as ImageIcon, Tag, DollarSign, Package,
  Sparkles, CheckCircle2, Loader2, Truck, Banknote, Home
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import DynamicAttributesForm from '@/components/product/DynamicAttributesForm'
import { Subcategory, ProductAttributes } from '@/types/product-attributes'

// ==================== TYPES ====================
interface ProductImage {
  id: string
  file: File
  preview: string
  compressed: boolean
  size: number
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function CreateProductPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [category, setCategory] = useState('')
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    stock: '1'
  })
  const [images, setImages] = useState<ProductImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // ========== NOUVEAUX ÉTATS POUR LIVRAISON & TYPE DE PRIX ==========
  const [deliveryAvailable, setDeliveryAvailable] = useState(true)
  const [priceType, setPriceType] = useState<'fixe' | 'negociable' | 'facilite'>('fixe')
  
  // ========== NOUVEAUX ÉTATS POUR CHARGEMENT DYNAMIQUE ==========
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null)
  const [productAttributes, setProductAttributes] = useState<ProductAttributes>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const discountPercent = productData.price && productData.old_price
    ? Math.round(((parseFloat(productData.old_price) - parseFloat(productData.price)) / parseFloat(productData.old_price)) * 100)
    : 0

  // ========== RÉCUPÉRATION DES CATÉGORIES ET SOUS-CATÉGORIES ==========
  useEffect(() => {
    async function fetchData() {
      console.log('🔍 Début du chargement des données...')
      const supabase = createSupabaseBrowserClient()
      
      // Récupérer les catégories
      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      console.log('📦 Catégories reçues:', cats)
      console.log('📦 Nombre de catégories:', cats?.length)
      console.log('❌ Erreur catégories:', catsError)
      
      // Récupérer les sous-catégories
      const { data: subs, error: subsError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      
      console.log('📦 Sous-catégories reçues:', subs)
      console.log('📦 Nombre de sous-catégories:', subs?.length)
      console.log('❌ Erreur sous-catégories:', subsError)
      
      if (cats) {
        setCategories(cats)
        console.log('✅ État categories mis à jour')
      }
      if (subs) {
        setSubcategories(subs)
        console.log('✅ État subcategories mis à jour')
      }
    }
    fetchData()
  }, [])

  // Log pour vérifier l'état des catégories
  useEffect(() => {
    console.log('📊 État actuel categories:', categories)
    console.log('📊 Nombre dans l\'état:', categories.length)
  }, [categories])

  // Récupérer la config des attributs de la sous-catégorie sélectionnée
  const selectedConfig = subcategories.find(s => s.id === selectedSubcategoryId)?.attributes_config

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
      console.log(`Image compressée: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`)
      return compressedFile
    } catch (error) {
      console.error('Erreur de compression:', error)
      toast.error('Erreur lors de la compression de l\'image')
      return file
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const remainingSlots = 5 - images.length
    if (remainingSlots === 0) {
      toast.error('Maximum 5 photos atteint')
      return
    }

    const fileArray = Array.from(files).slice(0, remainingSlots)
    setIsCompressing(true)
    toast.loading(`Compression de ${fileArray.length} image(s)...`, { id: 'compressing' })

    try {
      const newImages: ProductImage[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`)
          continue
        }

        const compressedFile = await compressImage(file)
        const preview = URL.createObjectURL(compressedFile)

        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: compressedFile,
          preview,
          compressed: true,
          size: compressedFile.size
        })
      }

      setImages(prev => [...prev, ...newImages])
      toast.success(
        `${newImages.length} image(s) compressée(s) avec succès ! 🎉`, 
        { id: 'compressing', duration: 3000 }
      )
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du traitement des images', { id: 'compressing' })
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const removeImage = (id: string) => {
    const imgToRemove = images.find(img => img.id === id)
    if (imgToRemove) {
      URL.revokeObjectURL(imgToRemove.preview)
    }
    setImages(prev => prev.filter(img => img.id !== id))
    toast.success('Image supprimée', { duration: 2000 })
  }

  // ==================== VALIDATION ====================
  const validateStep1 = (): boolean => {
    if (!category) {
      toast.error('Veuillez sélectionner une catégorie')
      return false
    }
    if (!selectedSubcategoryId) {
      toast.error('Veuillez sélectionner une sous-catégorie')
      return false
    }
    if (!productData.name.trim()) {
      toast.error('Le nom du produit est obligatoire')
      return false
    }
    if (!productData.price || parseFloat(productData.price) <= 0) {
      toast.error('Le prix de vente doit être supérieur à 0')
      return false
    }
    if (productData.old_price && parseFloat(productData.old_price) <= parseFloat(productData.price)) {
      toast.error('L\'ancien prix doit être supérieur au prix de vente')
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    return true // Tous les champs sont optionnels
  }

  // ==================== SOUMISSION ====================
  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      return
    }

    if (images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)
    toast.loading('Création du produit en cours...', { id: 'submit' })

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Vous devez être connecté pour créer un produit')
      }

      const imageUrls: string[] = []
      const totalImages = images.length

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const fileName = `${user.id}/${Date.now()}-${img.id}.jpg`
        
        setUploadProgress(Math.round(((i + 0.5) / totalImages) * 100))

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, img.file, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Erreur upload:', uploadError)
          throw new Error(`Erreur lors de l'upload de l'image ${i + 1}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
        setUploadProgress(Math.round(((i + 1) / totalImages) * 100))
      }

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          vendor_id: user.id,
          name: productData.name.trim(),
          description: productData.description.trim() || null,
          price: parseFloat(productData.price),
          old_price: productData.old_price ? parseFloat(productData.old_price) : null,
          category: category,
          subcategory_id: selectedSubcategoryId,
          stock: parseInt(productData.stock) || 1,
          images: imageUrls,
          attributes: productAttributes,
          delivery_available: deliveryAvailable,
          price_type: priceType,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erreur insertion:', insertError)
        throw new Error('Erreur lors de la création du produit')
      }

      toast.success('🎉 Produit créé avec succès !', { 
        id: 'submit',
        duration: 4000
      })

      setTimeout(() => {
        images.forEach(img => URL.revokeObjectURL(img.preview))
        window.location.href = '/dashboard/vendor/products'
      }, 2000)

    } catch (error: any) {
      console.error('Erreur complète:', error)
      toast.error(error.message || 'Une erreur est survenue lors de la création', { 
        id: 'submit',
        duration: 5000
      })
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // ==================== RENDU DES CHAMPS DYNAMIQUES ====================
  const renderDynamicFields = () => {
    if (!selectedSubcategoryId) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">
            Sélectionnez d'abord une sous-catégorie à l'étape 1
          </p>
        </div>
      )
    }

    if (!selectedConfig || selectedConfig.length === 0) {
      return (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <p className="text-white text-lg font-semibold mb-2">
            Aucune fiche technique requise
          </p>
          <p className="text-gray-400">
            Vous pouvez passer directement à l'étape suivante
          </p>
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                        flex items-center justify-center border border-white/10">
            <Tag className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Attributs du produit</h3>
            <p className="text-sm text-gray-400">
              Remplissez les champs selon la catégorie sélectionnée
            </p>
          </div>
        </div>

        <DynamicAttributesForm
          attributesConfig={selectedConfig}
          initialValues={productAttributes}
          onChange={setProductAttributes}
        />
      </motion.div>
    )
  }

  // ==================== RENDU PRINCIPAL ====================
  return (
    <div className="min-h-screen bg-[#0c0c0c] px-4 py-8 md:px-6 lg:px-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <div className="max-w-6xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 
                          flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Créer un produit
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Ajoutez un nouveau produit à votre boutique BZMarket
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-3 mt-8 bg-white/5 backdrop-blur-xl border border-white/10 
                   rounded-3xl p-6"
        >
          {[
            { num: 1, label: 'Informations de base' },
            { num: 2, label: 'Fiche technique' },
            { num: 3, label: 'Photos du produit' }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex items-center gap-3 flex-1">
                <motion.div 
                  animate={{ 
                    scale: currentStep === step.num ? 1.1 : 1,
                    backgroundColor: currentStep >= step.num ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)'
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white 
                           border-2 border-white/10 shadow-lg"
                >
                  {currentStep > step.num ? <CheckCircle2 className="w-6 h-6" /> : step.num}
                </motion.div>
                <span className={`font-semibold text-sm ${
                  currentStep === step.num ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < 2 && (
                <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {/* ==================== ÉTAPE 1 : INFORMATIONS DE BASE ==================== */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                flex items-center justify-center border border-white/10">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Informations du produit</h3>
                    <p className="text-sm text-gray-400">
                      Les champs marqués d'un <span className="text-red-400">*</span> sont obligatoires
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Catégorie */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Catégorie
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        console.log('🎯 Catégorie sélectionnée:', e.target.value)
                        setCategory(e.target.value)
                        setSelectedSubcategoryId(null)
                      }}
                      required
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 
                               focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.25rem'
                      }}
                    >
                      <option value="" className="bg-[#1a1a1a]">
                        Sélectionner une catégorie...
                      </option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug} className="bg-[#1a1a1a] py-2">
                          {cat.icon || '📦'} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sous-catégorie */}
                  {category && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-semibold text-gray-300">
                        Sous-catégorie
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <select
                        value={selectedSubcategoryId || ''}
                        onChange={(e) => {
                          console.log('🎯 Sous-catégorie sélectionnée:', e.target.value)
                          setSelectedSubcategoryId(Number(e.target.value))
                        }}
                        required
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                                 hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-2 
                                 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.25rem'
                        }}
                      >
                        <option value="" className="bg-[#1a1a1a]">
                          Sélectionner une sous-catégorie...
                        </option>
                        {subcategories
                          .filter(sub => {
                            const selectedCat = categories.find(c => c.slug === category)
                            return selectedCat && sub.category_id === selectedCat.id
                          })
                          .map(sub => (
                            <option key={sub.id} value={sub.id} className="bg-[#1a1a1a]">
                              {sub.name}
                            </option>
                          ))}
                      </select>
                    </motion.div>
                  )}

                  {/* Nom du produit */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Nom du produit
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      placeholder="Ex: iPhone 15 Pro Max 256Go..."
                      required
                      maxLength={100}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">
                      {productData.name.length}/100 caractères
                    </p>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={productData.description}
                      onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                      placeholder="Décrivez votre produit en détail..."
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all 
                               duration-200 resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {productData.description.length}/1000 caractères
                    </p>
                  </div>

                  {/* Prix de vente */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Prix de vente
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        placeholder="5000"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-11 pr-16 py-3.5 bg-white/5 border border-white/10 rounded-xl 
                                 text-white placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                        DA
                      </span>
                    </div>
                  </div>

                  {/* Ancien prix */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Ancien prix (optionnel)
                      {discountPercent > 0 && (
                        <span className="ml-2 text-green-400 text-xs">
                          -{discountPercent}%
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={productData.old_price}
                        onChange={(e) => setProductData({ ...productData, old_price: e.target.value })}
                        placeholder="8000"
                        min="0"
                        step="0.01"
                        className="w-full pl-11 pr-16 py-3.5 bg-white/5 border border-white/10 rounded-xl 
                                 text-white placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                        DA
                      </span>
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Stock disponible
                    </label>
                    <input
                      type="number"
                      value={productData.stock}
                      onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                      placeholder="1"
                      min="0"
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               placeholder:text-gray-500 hover:border-white/20 focus:outline-none 
                               focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  {/* Type de prix */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Type de prix
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: 'fixe', label: 'Fixe', icon: <Banknote className="w-4 h-4" /> },
                        { value: 'negociable', label: 'Négociable', icon: <DollarSign className="w-4 h-4" /> },
                        { value: 'facilite', label: 'Facilité', icon: <Home className="w-4 h-4" /> }
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPriceType(option.value as any)}
                          className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 
                                   flex items-center justify-center gap-2 font-semibold text-sm
                                   ${priceType === option.value 
                                     ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                     : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Livraison disponible */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={deliveryAvailable}
                          onChange={(e) => setDeliveryAvailable(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-14 h-7 rounded-full transition-all duration-300 
                                     ${deliveryAvailable ? 'bg-blue-500' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all 
                                       duration-300 ${deliveryAvailable ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                          Livraison disponible
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2)
                      }
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold 
                             rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 
                             flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==================== ÉTAPE 2 : FICHE TECHNIQUE ==================== */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {renderDynamicFields()}

                <div className="flex justify-between pt-6 mt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold 
                             rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Retour
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold 
                             rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 
                             flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==================== ÉTAPE 3 : PHOTOS ==================== */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                flex items-center justify-center border border-white/10">
                    <ImageIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Photos du produit</h3>
                    <p className="text-sm text-gray-400">
                      Ajoutez jusqu'à 5 photos (compression automatique)
                    </p>
                  </div>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all 
                           duration-300 ${isDragging 
                             ? 'border-blue-500 bg-blue-500/10' 
                             : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-white font-semibold mb-2">
                      Cliquez ou glissez-déposez vos images ici
                    </p>
                    <p className="text-sm text-gray-400">
                      JPEG, PNG • Max 5 photos • Compression automatique
                    </p>
                  </div>
                </div>

                {isCompressing && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-blue-400 font-semibold">Compression en cours...</span>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden border border-white/10 
                                      bg-white/5">
                          <img
                            src={img.preview}
                            alt={`Produit ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center 
                                   justify-center text-white opacity-0 group-hover:opacity-100 transition-all 
                                   duration-200 hover:scale-110 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg 
                                      px-2 py-1 text-xs text-white">
                          {(img.size / 1024).toFixed(0)} KB
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold 
                             rounded-xl hover:bg-white/10 transition-all duration-200 flex items-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || images.length === 0}
                    className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold 
                             rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 
                             flex items-center gap-2 shadow-lg shadow-green-500/20
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {uploadProgress > 0 ? `${uploadProgress}%` : 'Création...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Créer le produit
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
