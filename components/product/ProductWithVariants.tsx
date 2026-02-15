'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Star,
  Search,
  ShoppingBag,
  Truck,
  MapPin,
  MessageCircle,
  Phone,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type ProductStatus = 'active' | 'inactive' | 'sold' | 'draft'
type PriceType = 'fixe' | 'negociable' | 'facilite'

interface ProductVariantData {
  color: string
  size: string
  stock: number
  price: number
  sku: string
}

interface TemplateFields {
  [key: string]: string | number | boolean
}

interface ProductMetadata {
  variants?: ProductVariantData[]
  specifications?: {
    template: Array<{
      name: string
      values: string[]
    }>
    imageMapping?: Record<string, string>
  }
  template_fields?: TemplateFields
}

interface ProductRow {
  id: string
  vendor_id: string
  name: string
  description: string | null
  slug?: string
  category: string
  subcategory_id: number | null
  price: number
  old_price: number | null
  stock: number
  images: string[]
  status: ProductStatus
  delivery_available: boolean
  price_type: PriceType
  metadata: ProductMetadata | null
  attributes: Record<string, any> | null
  created_at: string
  updated_at: string
}

interface ProductWithVariantsProps {
  product: ProductRow
  displayPrice: number
  totalStock: number
}

const COLOR_HEX_MAP: Record<string, string> = {
  noir: '#000000',
  black: '#000000',
  blanc: '#FFFFFF',
  white: '#FFFFFF',
  gris: '#6B7280',
  gray: '#6B7280',
  grey: '#6B7280',
  'gris clair': '#D1D5DB',
  'light gray': '#D1D5DB',
  'gris foncé': '#374151',
  'dark gray': '#374151',
  'gris anthracite': '#374151',
  bleu: '#3B82F6',
  blue: '#3B82F6',
  'bleu marine': '#1E3A8A',
  'bleu roi': '#2563EB',
  'bleu ciel': '#0EA5E9',
  navy: '#1E3A8A',
  rouge: '#EF4444',
  red: '#EF4444',
  bordeaux: '#991B1B',
  vert: '#10B981',
  green: '#10B981',
  'vert foncé': '#059669',
  'vert lime': '#84CC16',
  violet: '#8B5CF6',
  purple: '#8B5CF6',
  mauve: '#A855F7',
  indigo: '#6366F1',
  beige: '#F5F5DC',
  marron: '#92400E',
  brown: '#92400E',
  'marron foncé': '#78350F',
  orange: '#F97316',
  'orange foncé': '#EA580C',
  jaune: '#F59E0B',
  'jaune vif': '#EAB308',
  rose: '#EC4899',
  pink: '#EC4899',
  fuchsia: '#D946EF',
  turquoise: '#14B8A6',
  cyan: '#06B6D4',
  sable: '#C2B280',
}

const normalizeColor = (value: string | null | undefined) =>
  (value ?? '').toLowerCase().trim()

export default function ProductWithVariants({
  product,
  displayPrice,
  totalStock,
}: ProductWithVariantsProps) {
  const variants = product.metadata?.variants ?? []
  const imageMapping = product.metadata?.specifications?.imageMapping ?? {}

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants],
  )

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants],
  )

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null,
  )
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const currentVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null
    const nColor = normalizeColor(selectedColor)
    const nSize = selectedSize.trim()
    return variants.find(
      (v) =>
        normalizeColor(v.color) === nColor &&
        v.size.trim() === nSize,
    )
  }, [variants, selectedColor, selectedSize])

  const effectivePrice = currentVariant?.price ?? displayPrice
  const effectiveStock = currentVariant?.stock ?? totalStock
  const canAddToCart = !!selectedColor && !!selectedSize && effectiveStock > 0

  const discountPercent = useMemo(() => {
    if (!product.old_price || product.old_price <= effectivePrice) return 0
    return Math.round(
      ((product.old_price - effectivePrice) / product.old_price) * 100,
    )
  }, [product.old_price, effectivePrice])

  const storeName =
    (product.attributes && product.attributes.store_name) || 'Boutique'
  const storeLocation =
    (product.attributes && product.attributes.store_location) ||
    'Adresse non renseignée'
  const storePhone =
    (product.attributes && product.attributes.store_phone) || ''
  const storeRating =
    (product.attributes && product.attributes.store_rating) || 4.8

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['/placeholder-product.png']

  const colorImages = useMemo(() => {
    return colors
      .map((color) => {
        const url = imageMapping[color]
        if (!url) return null
        return { color, url }
      })
      .filter(Boolean) as { color: string; url: string }[]
  }, [colors, imageMapping])

  const mainImageUrl = useMemo(() => {
    if (selectedColor && imageMapping[selectedColor]) {
      return imageMapping[selectedColor]
    }
    return images[selectedImage]
  }, [selectedColor, imageMapping, images, selectedImage])

  const isColorImage = useMemo(() => {
    return !!selectedColor && !!imageMapping[selectedColor]
  }, [selectedColor, imageMapping])

  const allImages = useMemo(() => {
    const colorUrls = colorImages.map(ci => ci.url)
    return [...colorUrls, ...images]
  }, [colorImages, images])

  const openLightbox = () => {
    const currentImageUrl = mainImageUrl
    const indexInAllImages = allImages.findIndex(url => url === currentImageUrl)
    setLightboxIndex(indexInAllImages >= 0 ? indexInAllImages : 0)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) {
        closeLightbox()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [lightboxOpen])

  const getColorHex = (colorName: string): string => {
    const normalized = normalizeColor(colorName)
    return COLOR_HEX_MAP[normalized] || '#9CA3AF'
  }

  const reviews = [
    {
      id: 1,
      author: 'Ahmed K.',
      rating: 5,
      comment: 'Excellent produit, très bonne qualité !',
      date: '2026-02-10',
      verified: true,
    },
    {
      id: 2,
      author: 'Fatima B.',
      rating: 4,
      comment: 'Bon rapport qualité/prix, livraison rapide',
      date: '2026-02-08',
      verified: true,
    },
  ]

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])

  return (
    <div className="bg-white text-gray-900 antialiased font-sans min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight">
                {storeName}
              </span>
              <div className="flex items-center bg-gray-100 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-black fill-current" />
                <span className="text-xs font-semibold ml-1">
                  {Number(storeRating).toFixed(1)}
                </span>
              </div>
            </div>
            <nav
              className="hidden md:flex space-x-8 text-sm font-medium text-gray-500"
              aria-label="Navigation principale"
            >
              <a href="/" className="text-black">
                Home
              </a>
              <a
                href="/products"
                className="hover:text-black transition-colors"
              >
                Catalog
              </a>
              <a href="/contact" className="hover:text-black transition-colors">
                Contact
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-50 rounded-full relative transition-colors"
                aria-label="Voir le panier"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Agrandissement de l'image du produit"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              closeLightbox()
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
            aria-label="Fermer"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[lightboxIndex]}
              alt={`Aperçu ${lightboxIndex + 1} de ${product.name}`}
              className="max-w-full max-h-full object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="pt-24 pb-16 lg:pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* LEFT COLUMN */}
          <section
            aria-label={`Images du produit ${product.name}`}
            className="product-images"
          >
            <div className="flex gap-3">
              {/* Couleurs verticales (desktop) avec hover */}
              {colorImages.length > 0 && (
                <div
                  className="hidden lg:flex flex-col gap-2 w-20"
                  aria-label="Aperçus par couleur"
                >
                  {colorImages.slice(0, 8).map(({ color, url }, index) => (
                    <button
                      key={color}
                      type="button"
                      onMouseEnter={() => {
                        setSelectedColor(color)
                      }}
                      onFocus={() => {
                        setSelectedColor(color)
                      }}
                      onClick={() => {
                        setSelectedColor(color)
                      }}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0 ${
                        selectedColor === color
                          ? 'border-black ring-2 ring-black ring-offset-2'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      title={color}
                      aria-label={`Voir le produit en couleur ${color}`}
                    >
                      <img
                        src={url}
                        alt={`Vue couleur ${color} de ${product.name}`}
                        className="w-full h-full object-cover"
                        loading={index < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        width={80}
                        height={80}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image principale */}
              <div className="flex-1">
                <div
                  className="w-full bg-gray-100 rounded-2xl overflow-hidden relative group cursor-zoom-in"
                  style={{ aspectRatio: '4/5' }}
                  onClick={openLightbox}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openLightbox()
                    }
                  }}
                  aria-label="Agrandir l'image du produit"
                >
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className={`w-full h-full ${
                      isColorImage ? 'object-contain p-4' : 'object-cover'
                    } transition duration-500 group-hover:scale-105`}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      aria-label="Partager le produit"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {product.delivery_available && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm pointer-events-none">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold">
                        Livraison disponible
                      </span>
                    </div>
                  )}

                  {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg pointer-events-none">
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Miniatures globales – centrées et légèrement vers la droite */}
            <div className="mt-4">
              <div className="flex items-start justify-center gap-4 overflow-x-auto pb-2 scrollbar-hide lg:pl-4">
                {images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onMouseEnter={() => {
                      setSelectedImage(index)
                      setSelectedColor(null)
                    }}
                    onFocus={() => {
                      setSelectedImage(index)
                      setSelectedColor(null)
                    }}
                    onClick={() => {
                      setSelectedImage(index)
                      setSelectedColor(null)
                    }}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index && !selectedColor
                        ? 'border-black ring-2 ring-black ring-offset-2'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    aria-label={`Voir l'aperçu ${index + 1} de ${product.name}`}
                  >
                    <img
                      src={img}
                      alt={`Vue ${index + 1} de ${product.name}`}
                      className="w-full h-full object-cover"
                      loading={index < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={80}
                      height={80}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs mobile */}
            {colorImages.length > 0 && (
              <div className="mt-3 lg:hidden">
                <div className="flex items-start justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {colorImages.slice(0, 8).map(({ color, url }, index) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedColor === color
                          ? 'border-black ring-2 ring-black ring-offset-2'
                          : 'border-gray-200'
                      }`}
                      aria-label={`Sélectionner la couleur ${color}`}
                    >
                      <img
                        src={url}
                        alt={`Vue couleur ${color} de ${product.name}`}
                        className="w-full h-full object-cover"
                        loading={index < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        width={64}
                        height={64}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN – identique à la version précédente */}
          {/* (je laisse tel quel car il est déjà SEO + responsive + PWA friendly) */}

          <section className="mt-10 lg:mt-0 lg:sticky lg:top-32 h-fit">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {effectivePrice.toLocaleString('fr-FR')}
                  </p>
                  <span className="text-lg text-gray-600 font-medium">DZD</span>
                </div>

                {product.old_price && product.old_price > effectivePrice && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl text-gray-400 line-through">
                        {product.old_price.toLocaleString('fr-FR')}
                      </p>
                      <span className="text-sm text-gray-400">DZD</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {product.price_type === 'negociable' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wide mt-3">
                  Négociable
                </span>
              )}
            </div>

            <div className="w-full h-px bg-gray-200 my-6" />

            <div className="space-y-8">
              {colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Couleur:{' '}
                    <span className="text-gray-500 font-normal">
                      {selectedColor || 'Aucune'}
                    </span>
                  </h3>
                  <div className="flex items-center flex-wrap gap-3">
                    {colors.map((color) => {
                      const hexColor = getColorHex(color)
                      const isWhite = hexColor.toUpperCase() === '#FFFFFF'

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`group relative flex items-center justify-center p-0.5 rounded-full focus:outline-none transition-all ${
                            selectedColor === color
                              ? 'ring-2 ring-gray-900 ring-offset-2'
                              : ''
                          }`}
                          title={color}
                          aria-label={`Choisir la couleur ${color}`}
                        >
                          <span className="sr-only">{color}</span>
                          <span
                            className={`h-8 w-8 rounded-full ${
                              isWhite ? 'border border-gray-300' : ''
                            } shadow-sm`}
                            style={{ backgroundColor: hexColor }}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Taille (EU)
                    </h3>
                    <a
                      href="#"
                      className="text-xs text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-black"
                    >
                      Guide des tailles
                    </a>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`flex items-center justify-center rounded-lg border py-3 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
                          selectedSize === size
                            ? 'bg-black text-white border-black shadow-md scale-105'
                            : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        aria-label={`Choisir la taille ${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Stock disponible:{' '}
                <span className="font-medium">
                  {effectiveStock > 0 ? `${effectiveStock}` : 'Rupture'}
                </span>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={!canAddToCart}
                  className={`w-full border rounded-xl py-4 px-8 flex items-center justify-center text-base font-bold transition-all active:scale-[0.98] ${
                    canAddToCart
                      ? 'bg-black border-transparent text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                      : 'bg-gray-200 border-transparent text-gray-500 cursor-not-allowed'
                  }`}
                  aria-disabled={!canAddToCart}
                >
                  Ajouter au panier
                </button>
                <button
                  type="button"
                  className="w-full bg-white border border-black rounded-xl py-4 px-8 flex items-center justify-center text-base font-bold text-black hover:bg-gray-50 focus:outline-none active:scale-[0.98]"
                >
                  Commander maintenant
                </button>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed pt-2">
                  {product.description}
                </p>
              )}
            </div>

            <div className="mt-8 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {storeName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{storeLocation}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="Envoyer un message"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  {!product.delivery_available && (
                    <>
                      {storePhone && (
                        <a
                          href={`https://wa.me/${storePhone.replace(/\s/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5 fill-current" />
                        </a>
                      )}

                      {storePhone && (
                        <a
                          href={`tel:${storePhone}`}
                          className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                          title="Appeler"
                        >
                          <Phone className="w-5 h-5 fill-current" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="w-full h-32 bg-gray-200 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors z-10">
                  <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                    Voir sur la carte
                  </span>
                </div>
                <div className="w-full h-full opacity-60 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale" />
              </div>
            </div>
          </section>
        </div>

        {/* Avis clients */}
        <section className="mt-16 border-t border-gray-200 pt-12">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Avis clients
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(Number(averageRating))
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {averageRating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviews.length} avis)
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="px-6 py-3 border-2 border-black rounded-xl font-bold text-black hover:bg-black hover:text-white transition-all"
              >
                Laisser un avis
              </button>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900" itemProp="author">
                          {review.author}
                        </p>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            ✓ Achat vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p
                    className="text-gray-700 leading-relaxed"
                    itemProp="reviewBody"
                  >
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
