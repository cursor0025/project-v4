'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import ModeSpecificationsForm from '@/components/product/ModeSpecificationsForm'
import type { AttributeField, ProductAttributes } from '@/types/product-attributes'
import SimpleVariantGrid, { SimpleVariant } from '@/components/product/SimpleVariantGrid'
import DynamicTemplateFields from '@/components/product/DynamicTemplateFields'

/* --------- Icônes locales --------- */

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
  </svg>
)

const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* --------- Config catégories / tailles --------- */

const VARIANT_CATEGORIES = [
  'vetements-femme',
  'vetements-homme',
  'vetements-homme-classique',
  'sportswear',
  'vetements-bebe',
  'fete-mariage',
  'chaussures',
]

const SIZE_PRESETS = {
  standard: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  pants: ['36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56'],
  shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  kids: ['2A', '4A', '6A', '8A', '10A', '12A', '14A'],
} as const

interface Category {
  id: number
  name: string
  slug: string
}

interface Subcategory {
  id: number
  name: string
  slug: string
  category_id: number
  attributes_config?: AttributeField[]
}

export default function CreateProductPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  /* --------- État global --------- */

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    stock: '',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('')

  const [productAttributes, setProductAttributes] = useState<ProductAttributes>({})
  const [templateFields, setTemplateFields] = useState<Record<string, any>>({})

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageSizes, setImageSizes] = useState<number[]>([])

  const [deliveryAvailable, setDeliveryAvailable] = useState(true)
  const [priceType, setPriceType] = useState<'fixe' | 'negociable' | 'facilite'>('fixe')

  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<SimpleVariant[]>([])
  const [variantImages, setVariantImages] = useState<Record<string, File>>({}) // ✅ Images par couleur
  const [basePrice, setBasePrice] = useState(2500)
  const [baseSKU] = useState('PROD')
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  /* --------- Chargement catégories --------- */

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) return
    loadSubcategories(Number(selectedCategoryId))
  }, [selectedCategoryId])

  /* --------- Détection mode variantes + tailles --------- */

  useEffect(() => {
    if (!selectedCategoryId) {
      setHasVariants(false)
      setAvailableSizes([])
      return
    }

    const currentCategory = categories.find(
      (c) => c.id === Number(selectedCategoryId),
    )
    if (!currentCategory) return

    const categorySlug = currentCategory.slug.toLowerCase()
    const catName = currentCategory.name.toLowerCase()

    const isClothingCategory = VARIANT_CATEGORIES.some((keyword) =>
      categorySlug.includes(keyword),
    )

    setHasVariants(isClothingCategory)

    if (!isClothingCategory) {
      setAvailableSizes([])
      return
    }

    const currentSubcategory = subcategories.find(
      (s) => s.id === Number(selectedSubcategoryId),
    )

    const subName = (currentSubcategory?.name || '').toLowerCase()
    const subSlug = (currentSubcategory?.slug || '').toLowerCase()

    if (
      subName.includes('chaussure') ||
      subName.includes('basket') ||
      subName.includes('botte') ||
      subSlug.includes('chaussure') ||
      subSlug.includes('basket')
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
  }, [selectedCategoryId, selectedSubcategoryId, categories, subcategories])

  /* --------- Supabase helpers --------- */

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      toast.error('Erreur chargement catégories')
      return
    }
    setCategories(data || [])
  }

  const loadSubcategories = async (categoryId: number) => {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      toast.error('Erreur chargement sous-catégories')
      return
    }
    setSubcategories(data || [])
  }

  /* --------- Helper format taille --------- */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  /* --------- Images principales --------- */

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images')
      return
    }

    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          return await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          })
        } catch {
          return file
        }
      }),
    )

    setImages((prev) => [...prev, ...compressedFiles])
    setImageSizes((prev) => [...prev, ...compressedFiles.map((f) => f.size)])

    const newPreviews = await Promise.all(
      compressedFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          }),
      ),
    )

    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageSizes((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (
    files: File[],
    path = 'products',
  ): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`
      const filePath = `${path}/${fileName}`

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (error) {
        console.error('Supabase upload error:', error)
        continue
      }

      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicData.publicUrl)
    }

    return uploadedUrls
  }

  /* --------- Submit --------- */

  const handleSubmit = async () => {
    if (!productData.name || !selectedCategoryId || !selectedSubcategoryId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (hasVariants && variants.length === 0) {
      toast.error('Veuillez définir le stock dans la grille')
      return
    }

    if (!hasVariants && (!productData.price || !productData.stock)) {
      toast.error('Prix et stock sont obligatoires')
      return
    }

    if (images.length === 0) {
      toast.error('Au moins une image principale est requise')
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Non authentifié')
        setIsSubmitting(false)
        return
      }

      // ✅ Upload images générales
      toast.loading('Upload des images générales...')
      const imageUrls = await uploadImages(images)
      toast.dismiss()

      if (imageUrls.length === 0) throw new Error('Erreur upload images')

      // ✅ Upload images par couleur (variantes)
      let imageMapping: Record<string, string> = {}

      if (hasVariants && Object.keys(variantImages).length > 0) {
        toast.loading('Upload des images de couleur...')
        
        for (const [color, file] of Object.entries(variantImages)) {
          const fileName = `${Date.now()}-${color.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}.jpg`
          const filePath = `variant-images/${fileName}`

          const { data, error } = await supabase.storage
            .from('products')
            .upload(filePath, file)

          if (error) {
            console.error(`Erreur upload image ${color}:`, error)
            continue
          }

          const { data: publicData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath)

          imageMapping[color] = publicData.publicUrl
        }

        toast.dismiss()
        toast.success(`${Object.keys(imageMapping).length} images de couleur uploadées`)
      }

      const selectedCategory = categories.find(
        (c) => c.id === Number(selectedCategoryId),
      )

      const finalProductData: any = {
        vendor_id: user.id,
        name: productData.name,
        description: productData.description || null,
        category: selectedCategory?.name || '',
        subcategory_id: parseInt(selectedSubcategoryId),
        images: imageUrls,
        delivery_available: deliveryAvailable,
        price_type: priceType,
        status: 'active',
        metadata: {},
        attributes: {},
      }

      if (hasVariants && variants.length > 0) {
        const prices = variants.map((v) => v.price)
        finalProductData.price = Math.min(...prices)
        finalProductData.stock = variants.reduce((sum, v) => sum + v.stock, 0)
        finalProductData.old_price = productData.old_price
          ? parseFloat(productData.old_price)
          : null

        const colors = Array.from(new Set(variants.map((v) => v.color)))
        const sizes = Array.from(new Set(variants.map((v) => v.size)))

        finalProductData.metadata = {
          specifications: {
            template: [
              { name: 'Couleur', values: colors },
              { name: 'Taille', values: sizes },
            ],
            imageMapping, // ✅ Mapping couleur → URL image
          },
          variants: variants.map(v => ({
            color: v.color,
            size: v.size,
            stock: v.stock,
            price: v.price,
            sku: v.sku
          })),
          template_fields: templateFields
        }
        finalProductData.attributes = {}
      } else {
        finalProductData.price = parseFloat(productData.price)
        finalProductData.old_price = productData.old_price
          ? parseFloat(productData.old_price)
          : null
        finalProductData.stock = parseInt(productData.stock)
        finalProductData.attributes = productAttributes
        finalProductData.metadata = {
          template_fields: templateFields
        }
      }

      console.log('📦 Données envoyées à Supabase:', finalProductData)

      const { error } = await supabase.from('products').insert(finalProductData)

      if (error) {
        console.error('=== ERREUR SUPABASE COMPLÈTE ===')
        console.error('Message:', error.message)
        console.error('Code:', error.code)
        console.error('Details:', error.details)
        
        toast.error(`Erreur: ${error.message}`)
        setIsSubmitting(false)
        return
      }

      toast.success('Produit publié avec succès !')
      setTimeout(() => router.push('/dashboard/vendor/products'), 1000)
    } catch (error: any) {
      console.error('Erreur création:', error)
      toast.error(error.message || 'Erreur lors de la création')
      setIsSubmitting(false)
    }
  }

  /* --------- Styles utilitaires --------- */

  const inputClass =
    'w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-2'

  /* --------- Rendu --------- */

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header global */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-4xl font-bold text-white">Créer un nouveau produit</h1>
          <p className="text-gray-400 mt-2">Étape {currentStep} sur 3</p>
        </div>

        {/* Étapes progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 px-1">
            <span className={currentStep >= 1 ? 'text-blue-400' : ''}>Infos</span>
            <span className={currentStep >= 2 ? 'text-purple-400' : ''}>
              Spécifications
            </span>
            <span className={currentStep >= 3 ? 'text-pink-400' : ''}>Images</span>
          </div>
        </div>

        {/* Étape 1 */}
        {currentStep === 1 && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-700/60 shadow-2xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Étape 1 : Informations de base
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Catégorie *</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value)
                    setSelectedSubcategoryId('')
                    setTemplateFields({})
                  }}
                  className={inputClass}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Sous-catégorie *</label>
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Sélectionner une sous-catégorie</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Nom du produit *</label>
              <input
                type="text"
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
                className={inputClass}
                placeholder="Ex : Robe élégante"
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={productData.description}
                onChange={(e) =>
                  setProductData({ ...productData, description: e.target.value })
                }
                rows={4}
                className={inputClass}
                placeholder="Décrivez votre produit..."
              />
            </div>

            {!hasVariants && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Prix (DA) *</label>
                    <input
                      type="number"
                      value={productData.price}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          price: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stock *</label>
                    <input
                      type="number"
                      value={productData.stock}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          stock: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelClass}>
                    Ancien prix (DA){' '}
                    <span className="text-xs text-gray-500">
                      (optionnel, pour afficher une promo)
                    </span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      value={productData.old_price}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          old_price: e.target.value,
                        })
                      }
                      className={`${inputClass} flex-1`}
                      placeholder="15000"
                    />
                    <div className="px-4 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/60 text-emerald-400 font-semibold text-sm min-w-[90px] text-center">
                      {productData.old_price && productData.price
                        ? `%-${Math.max(
                            0,
                            Math.min(
                              99,
                              Math.round(
                                ((parseFloat(productData.old_price || '0') -
                                  parseFloat(productData.price || '0')) /
                                  parseFloat(productData.old_price || '1')) *
                                  100,
                              ),
                            ),
                          )}`
                        : '% 0'}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={
                  !productData.name ||
                  !selectedCategoryId ||
                  !selectedSubcategoryId
                }
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium shadow-lg transition-all"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Étape 2 : Spécifications
            </h2>

            {hasVariants && (
              <div className="rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-blue-600 p-[1px] mb-4">
                <div className="bg-[#020617] rounded-2xl px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg">
                      <SparklesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        Mode Variantes Intelligent
                      </p>
                      <p className="text-xs text-gray-300">
                        Tailles détectées :{' '}
                        {availableSizes.length
                          ? availableSizes.join(', ')
                          : 'XS, S, M, L, XL, XXL, 3XL'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasVariants ? (
              <SimpleVariantGrid
                basePrice={basePrice}
                setBasePrice={setBasePrice}
                baseSKU={baseSKU}
                availableSizes={availableSizes}
                onChange={setVariants}
                onImagesChange={setVariantImages}
              />
            ) : (
              <>
                <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-700 rounded-full p-2">
                      <InfoIcon className="w-5 h-5 text-gray-200" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        Produit simple (pas de grille)
                      </h3>
                      <p className="text-sm text-gray-400">
                        Cette catégorie n&apos;utilise pas encore les variantes. Remplissez les
                        spécifications classiques.
                      </p>
                    </div>
                  </div>
                  <ModeSpecificationsForm
                    subcategoryId={Number(selectedSubcategoryId)}
                    subcategories={subcategories}
                    attributes={productAttributes}
                    onChange={setProductAttributes}
                  />
                </div>

                {selectedCategoryId && (
                  <DynamicTemplateFields
                    category={categories.find(c => c.id === Number(selectedCategoryId))?.slug || ''}
                    values={templateFields}
                    onChange={setTemplateFields}
                    disabled={isSubmitting}
                  />
                )}
              </>
            )}

            {hasVariants && (
              <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-4">
                <div>
                  <label className={labelClass}>
                    Ancien prix global (DA){' '}
                    <span className="text-xs text-gray-500">
                      (optionnel, pour afficher une promotion)
                    </span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      value={productData.old_price}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          old_price: e.target.value,
                        })
                      }
                      className={`${inputClass} flex-1`}
                      placeholder="15000"
                    />
                    <div className="px-4 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/60 text-emerald-400 font-semibold text-sm min-w-[90px] text-center">
                      {productData.old_price && basePrice
                        ? `%-${Math.max(
                            0,
                            Math.min(
                              99,
                              Math.round(
                                ((parseFloat(productData.old_price || '0') -
                                  Number(basePrice || 0)) /
                                  parseFloat(productData.old_price || '1')) *
                                  100,
                              ),
                            ),
                          )}`
                        : '% 0'}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      Livraison
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryAvailable(true)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                          deliveryAvailable
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg'
                            : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:border-emerald-500/60'
                        }`}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-lg">
                          🚚
                        </span>
                        <span className="text-sm font-semibold">
                          Disponible
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryAvailable(false)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                          !deliveryAvailable
                            ? 'bg-red-600/20 border-red-500 text-red-300 shadow-lg'
                            : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:border-red-500/60'
                        }`}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-lg">
                          🚚
                        </span>
                        <span className="text-sm font-semibold">
                          Non disponible
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Type de prix</label>
                    <select
                      value={priceType}
                      onChange={(e) =>
                        setPriceType(
                          e.target.value as 'fixe' | 'negociable' | 'facilite',
                        )
                      }
                      className={inputClass}
                    >
                      <option value="fixe">Prix fixe</option>
                      <option value="negociable">Négociable</option>
                      <option value="facilite">Paiement facilité</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-amber-300 mt-2">
                  Pour les vêtements et chaussures, le prix de base utilisé pour la
                  promotion est celui défini dans la grille (prix de base global).
                </p>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all"
              >
                ← Précédent
              </button>
              <button
                onClick={() => {
                  if (hasVariants && variants.length === 0) {
                    toast.error('Veuillez ajouter du stock dans la grille')
                    return
                  }
                  setCurrentStep(3)
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg transition-all"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : 5 emplacements fixes */}
        {currentStep === 3 && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-700/60 shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Étape 3 : Images & publication
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ajoutez jusqu&apos;à 5 photos de haute qualité ({images.length}/5)
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Compression automatique &lt; 300Ko
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center bg-gray-900/30 hover:border-blue-500/50 transition-all group cursor-pointer">
              <UploadIcon className="mx-auto text-gray-500 mb-4 group-hover:text-blue-400 w-12 h-12 transition-colors" />
              <label className="cursor-pointer">
                <span className="text-blue-400 hover:text-blue-300 font-medium text-lg">
                  Glissez vos images ici ou cliquez
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Formats acceptés : JPG, PNG, WebP • Poids max par image: 10 Mo
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Compression automatique activée pour des performances optimales
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-gray-300">
                  Images ajoutées ({images.length})
                </p>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, index) => {
                  const hasImage = index < imagePreviews.length
                  return (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                        hasImage
                          ? 'border-blue-500/60 shadow-lg shadow-blue-500/20'
                          : 'border-dashed border-gray-700 bg-gray-900/30'
                      }`}
                    >
                      {hasImage ? (
                        <>
                          <img
                            src={imagePreviews[index]}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1.5 rounded-full text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-all shadow-lg z-10"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg">
                              Principal
                            </span>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <span className="text-[10px] text-emerald-300 font-semibold">
                              {formatFileSize(imageSizes[index])}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">Emplacement {index + 1}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-blue-300 mb-1">
                  Conseil: Ajoutez plus de photos
                </p>
                <p className="text-xs text-gray-400">
                  Les produits avec 4-5 photos génèrent en moyenne 3x plus de vues et se vendent 2x plus rapidement.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all"
              >
                ← Précédent
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || images.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Publication en cours...' : 'PUBLIER LE PRODUIT'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
